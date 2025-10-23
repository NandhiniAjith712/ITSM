import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../tickets/UserForm';
import './UserDashboard.css';

const UserDashboard = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [replies, setReplies] = useState({});
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    unreadReplies: 0
  });
  
  // SLA Configurations state
  const [slaConfigurations, setSlaConfigurations] = useState({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [repliesSortConfig, setRepliesSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  // Enhanced search and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const navigate = useNavigate();

  // Listen for form messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.action === 'toggleForm') {
        setShowForm(!showForm);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [showForm]);

  // Check for auto-login URL parameters and user data
  useEffect(() => {
    const checkAutoLoginAndUserData = () => {
      // First check if user prop is passed
      if (user) {
        setCurrentUser(user);
        return;
      }

      // Check for auto-login URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const isAutoLogin = urlParams.get('auto_login');
      
      if (isAutoLogin === 'true') {
        console.log('🔗 Auto-login detected from URL parameters');
        
        // Extract user data from URL parameters
        const autoLoginUser = {
          id: urlParams.get('user_id'),
          name: urlParams.get('user_name'),
          email: urlParams.get('user_email'),
          role: urlParams.get('user_role'),
          token: decodeURIComponent(urlParams.get('token') || '')
        };
        
        console.log('🔑 Raw token from URL:', urlParams.get('token'));
        console.log('🔑 Decoded token:', autoLoginUser.token);
        
        // Extract product from URL parameters
        const product = urlParams.get('product');
        console.log('🎯 Product from URL parameters:', product);
        
        console.log('📋 Auto-login user data:', autoLoginUser);
        
                  // Store in localStorage
          try {
            localStorage.setItem('access_token', autoLoginUser.token);
            localStorage.setItem('user_id', autoLoginUser.id);
            localStorage.setItem('user_name', autoLoginUser.name);
            localStorage.setItem('user_email', autoLoginUser.email);
            localStorage.setItem('user_role', autoLoginUser.role);
            localStorage.setItem('is_logged_in', 'true');
            
            // Also store user data in the format expected by CustomerChatPage
            localStorage.setItem('userData', JSON.stringify(autoLoginUser));
            
            // Store auto-login context
            const autoLoginContext = {
              email: autoLoginUser.email,
              name: autoLoginUser.name,
              product: product,
              source: 'auto-login',
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('autoLoginContext', JSON.stringify(autoLoginContext));
            console.log('🔗 Auto-login context stored:', autoLoginContext);
            
            console.log('✅ Auto-login data stored in localStorage');
            
            // Set current user
            setCurrentUser(autoLoginUser);
            
            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          
        } catch (error) {
          console.error('❌ Error storing auto-login data:', error);
        }
        
        return;
      }

      // Check localStorage for existing user data (multiple formats)
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          return;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }

      // Check for auto-login stored data
      const autoLoginUserId = localStorage.getItem('user_id');
      const autoLoginUserName = localStorage.getItem('user_name');
      const autoLoginUserEmail = localStorage.getItem('user_email');
      const autoLoginUserRole = localStorage.getItem('user_role');
      
      if (autoLoginUserId && autoLoginUserName && autoLoginUserEmail) {
        console.log('🔍 Found auto-login data in localStorage');
        const autoLoginUser = {
          id: autoLoginUserId,
          name: autoLoginUserName,
          email: autoLoginUserEmail,
          role: autoLoginUserRole || 'user'
        };
        console.log('✅ Setting current user from auto-login data:', autoLoginUser);
        
        // Also store in userData format for CustomerChatPage
        localStorage.setItem('userData', JSON.stringify(autoLoginUser));
        
        setCurrentUser(autoLoginUser);
        return;
      }

      // Check for legacy user format
      const legacyUser = localStorage.getItem('tickUser');
      if (legacyUser) {
        try {
          const legacyUserData = JSON.parse(legacyUser);
          setCurrentUser(legacyUserData);
          return;
        } catch (error) {
          console.error('Error parsing legacy user data:', error);
        }
      }

      // No user data found
      console.log('❌ No user data found in any storage location');
      setCurrentUser(null);
      setLoading(false);
      
      // Show error message for debugging
      setError('No user data found. Please try logging in again or contact support.');
    };

    checkAutoLoginAndUserData();
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
      fetchSLAConfigurations(); // Fetch SLA configurations on mount
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Real-time refresh for new replies
  useEffect(() => {
    if (!currentUser) return;

    // Set up interval to check for new replies every 30 seconds
    const intervalId = setInterval(() => {
      if (tickets && tickets.length > 0) {
        const validTickets = tickets.filter(ticket => ticket && ticket.id);
        validTickets.forEach(ticket => {
          if (ticket && ticket.id) {
            fetchReplies(ticket.id);
          }
        });
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser, tickets]);

  const fetchTickets = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/user/${currentUser.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter out invalid tickets before setting state
        const validTickets = data.data.filter(ticket => ticket && ticket.id);
        setTickets(validTickets);
        
        // Fetch replies for each valid ticket
        validTickets.forEach(ticket => {
          if (ticket && ticket.id) {
            fetchReplies(ticket.id);
          }
        });
        calculateStats(validTickets);
      } else {
        console.error('Failed to fetch tickets:', data.message);
        setError(data.message || 'Failed to fetch tickets');
        setTickets([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Network error. Please try again.');
      setTickets([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId) => {
    if (!ticketId) return;
    
    try {
      // Use the chat API instead of the old replies API
      const res = await fetch(`http://localhost:5000/api/chat/messages/${ticketId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const previousReplies = replies[ticketId] || [];
        const newReplies = data.data.filter(reply => reply && reply.id); // Filter valid replies
        
        // Sort replies by timestamp (newest first) - default sorting
        const sortedReplies = newReplies.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || 0);
          const dateB = new Date(b.created_at || b.timestamp || 0);
          
          // Check if dates are valid
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0;
          }
          
          return dateB - dateA;
        });
        
        // Check if there are new agent replies
        const newAgentReplies = sortedReplies.filter(newReply => 
          newReply && newReply.sender_type === 'agent' && 
          !previousReplies.some(prevReply => 
            prevReply && prevReply.id === newReply.id
          )
        );
        
        // Removed notification for new agent replies
        
        setReplies(prev => ({ ...prev, [ticketId]: sortedReplies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  // Fetch SLA configurations for timer calculations
  const fetchSLAConfigurations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sla/configurations');
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Create a lookup map for quick access
          const configMap = {};
          result.data.forEach(config => {
            if (config && config.product_id && config.module_id && config.issue_name) {
              const key = `${config.product_id}_${config.module_id}_${config.issue_name}`;
              configMap[key] = config;
            }
          });
          setSlaConfigurations(configMap);
        }
      } else {
        console.error('Failed to fetch SLA configurations');
      }
    } catch (error) {
      console.error('Error fetching SLA configurations:', error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const calculateStats = (ticketData) => {
    if (!ticketData || !Array.isArray(ticketData)) {
      setStats({ total: 0, open: 0, inProgress: 0, closed: 0, unreadReplies: 0 });
      return;
    }

    // Filter out invalid tickets
    const validTickets = ticketData.filter(t => t && t.status);
    
    const total = validTickets.length;
    const open = validTickets.filter(t => t.status === 'open').length;
    const inProgress = validTickets.filter(t => t.status === 'in_progress').length;
    const closed = validTickets.filter(t => t.status === 'closed').length;
    
    // Calculate unread replies
    let unreadCount = 0;
    Object.values(replies).forEach(ticketReplies => {
      if (Array.isArray(ticketReplies)) {
        unreadCount += ticketReplies.filter(reply => 
          reply && reply.sender_type === 'agent' && !reply.is_read
        ).length;
      }
    });

    setStats({ total, open, inProgress, closed, unreadReplies: unreadCount });
  };

  const handleTicketSubmitted = async (newTicket) => {
    if (newTicket && newTicket.id) {
      setTickets(prev => [newTicket, ...prev]);
      calculateStats([newTicket, ...tickets]);
      setShowForm(false);
      showNotification('✅ New ticket submitted successfully!');
    }
  };

  const refreshAllReplies = async () => {
    if (tickets && tickets.length > 0) {
      const validTickets = tickets.filter(ticket => ticket && ticket.id);
      if (validTickets.length > 0) {
        await Promise.all(validTickets.map(ticket => fetchReplies(ticket.id)));
        showNotification('🔄 Replies refreshed!');
      }
    }
  };

  const retryFetch = () => {
    fetchTickets();
  };

  const handleCloseTicket = async (ticketId) => {
    if (!currentUser || !currentUser.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setTickets(prev => {
          const updatedTickets = prev.map(ticket => 
            ticket && ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
          );
          // Recalculate stats with the updated tickets
          calculateStats(updatedTickets);
          return updatedTickets;
        });
        showNotification('✅ Ticket closed successfully!');
        refreshAllReplies(); // Refresh replies for the closed ticket
      } else {
        console.error('Failed to close ticket:', data.message);
        showNotification('❌ Failed to close ticket: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      showNotification('❌ Network error. Failed to close ticket.');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'closed': return '#10b981';
      case 'escalated': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'UNKNOWN';
    
    switch (status) {
      case 'open': return 'OPEN';
      case 'in_progress': return 'IN PROGRESS';
      case 'closed': return 'CLOSED';
      case 'escalated': return 'ESCALATED';
      default: return status.toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openChatModal = (ticket) => {
    console.log('🔗 Opening chat for ticket:', ticket.id);
    console.log('👤 Current user:', currentUser);
    console.log('📋 User data in localStorage:', localStorage.getItem('userData'));
    console.log('🔗 Auto-login context:', localStorage.getItem('autoLoginContext'));
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
    
    // Ensure userData is stored before navigating
    if (currentUser && !localStorage.getItem('userData')) {
      console.log('🔧 Storing userData before navigation:', currentUser);
      localStorage.setItem('userData', JSON.stringify(currentUser));
    }
    
    navigate(`/chat/${ticket.id}`);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    if (!priority) return '#666666';
    
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#44aa44';
      default: return '#666666';
    }
  };

  // Calculate SLA timer for a ticket
  const calculateSLATimer = (ticket) => {
    if (!ticket || !ticket.product_id || !ticket.module_id || !ticket.issue_type || !ticket.created_at) {
      return null;
    }

    const key = `${ticket.product_id}_${ticket.module_id}_${ticket.issue_type}`;
    const slaConfig = slaConfigurations[key];
    
    if (!slaConfig) {
      return null;
    }

    const now = new Date();
    const ticketCreatedAt = new Date(ticket.created_at);
    
    // Check if the date is valid
    if (isNaN(ticketCreatedAt.getTime())) {
      return null;
    }
    
    const slaTimeMinutes = slaConfig.response_time_minutes || 480; // Default 8 hours
    const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
    
    const remainingMs = slaDeadline.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    
    const isBreached = remainingMs < 0;
    const isWarning = remainingMinutes <= 30 && remainingMinutes > 0;
    
    return {
      remainingMinutes,
      isBreached,
      isWarning,
      slaTimeMinutes,
      deadline: slaDeadline,
      priority: slaConfig.priority_level
    };
  };

  // Format time for display
  const formatSLATime = (minutes) => {
    if (!minutes || isNaN(minutes) || minutes < 0) {
      return '0m';
    }
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);
      return `${days}d ${hours}h`;
    }
  };

  // Sorting functions
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };


  const sortTickets = (ticketsToSort) => {
    if (!ticketsToSort || !Array.isArray(ticketsToSort) || !sortConfig.key) {
      return ticketsToSort || [];
    }

    // Filter out invalid tickets first
    const validTickets = ticketsToSort.filter(ticket => ticket && ticket.id);

    return validTickets.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at' || sortConfig.key === 'closed_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle priority sorting
      if (sortConfig.key === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      // Handle status sorting
      if (sortConfig.key === 'status') {
        const statusOrder = { open: 1, in_progress: 2, closed: 3, escalated: 4 };
        aValue = statusOrder[aValue] || 0;
        bValue = statusOrder[bValue] || 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getStatsArray = (statsData) => {
    return [
      { key: 'total', label: 'Total Tickets', value: statsData.total, icon: '📊' },
      { key: 'open', label: 'Open Tickets', value: statsData.open, icon: '🆕' },
      { key: 'inProgress', label: 'In Progress', value: statsData.inProgress, icon: '⚡' },
      { key: 'closed', label: 'Closed', value: statsData.closed, icon: '✅' },
      ...(statsData.unreadReplies > 0 ? [{ key: 'unreadReplies', label: 'Unread Replies', value: statsData.unreadReplies, icon: '💬' }] : [])
    ];
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };


  const handleRepliesSort = (key) => {
    setRepliesSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortReplies = (repliesToSort) => {
    if (!repliesToSort || !repliesSortConfig.key) return repliesToSort;

    return [...repliesToSort].sort((a, b) => {
      let aValue, bValue;

      switch (repliesSortConfig.key) {
        case 'timestamp':
          aValue = new Date(a.created_at || a.timestamp || 0);
          bValue = new Date(b.created_at || b.timestamp || 0);
          break;
        case 'sender':
          aValue = (a.sender_name || a.sender_type || '').toLowerCase();
          bValue = (b.sender_name || b.sender_type || '').toLowerCase();
          break;
        case 'message':
          aValue = (a.message || a.content || '').toLowerCase();
          bValue = (b.message || b.content || '').toLowerCase();
          break;
        default:
          aValue = a[repliesSortConfig.key];
          bValue = b[repliesSortConfig.key];
      }

      if (aValue < bValue) {
        return repliesSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return repliesSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getRepliesSortIcon = (key) => {
    if (repliesSortConfig.key !== key) return '↕️';
    return repliesSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const resetAllSorting = () => {
    setSortConfig({ key: 'created_at', direction: 'desc' });
    setRepliesSortConfig({ key: 'timestamp', direction: 'desc' });
  };

  // Compact SLA Timer Indicator Component
  const SLATimerIndicator = ({ ticket }) => {
    if (!ticket || !ticket.id) {
      return (
        <div className="sla-timer-inline no-config">
          <span>⏰ No SLA</span>
        </div>
      );
    }

    const slaTimer = calculateSLATimer(ticket);
    
    if (!slaTimer) {
      return (
        <div className="sla-timer-inline no-config">
          <span>⏰ No SLA</span>
        </div>
      );
    }

    const { remainingMinutes, isBreached, isWarning } = slaTimer;
    
    let statusClass = 'normal';
    let statusIcon = '⏰';
    let statusColor = '#44aa44';
    
    if (isBreached) {
      statusClass = 'breached';
      statusIcon = '🚨';
      statusColor = '#ff4444';
    } else if (isWarning) {
      statusClass = 'warning';
      statusIcon = '⚠️';
      statusColor = '#ff8800';
    }

    return (
      <div className={`sla-timer-inline ${statusClass}`} style={{ color: statusColor }}>
        <span className="timer-icon">{statusIcon}</span>
        <span className="timer-time">
          {isBreached ? (
            `🚨 ${formatSLATime(Math.abs(remainingMinutes))} OVERDUE`
          ) : (
            `${isWarning ? '⚠️ ' : '⏰ '}${formatSLATime(remainingMinutes)}`
          )}
        </span>
      </div>
    );
  };

  // Show loading if no user data yet
  if (!currentUser && loading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show welcome message if no user data
  if (!currentUser) {
    return (
      <div className="user-dashboard-container">
        <div className="welcome-container">
          <h1>Welcome to Customer Support! 🎉</h1>
          <p>Please wait while we load your information...</p>
          <p>If you came from GRC, your auto-login should complete shortly.</p>
          <div className="loading-spinner" style={{ margin: '20px auto' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back, {currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer'}! 👋</h1>
          <p className="welcome-subtitle">Here's your personalized ticket overview</p>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.email?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="user-details">
            <span className="user-name">{currentUser?.name || currentUser?.email || 'Customer'}</span>
            <span className="user-email">{currentUser?.email || 'customer@example.com'}</span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="notification-toast">
          <div className="notification-content">
            <span className="notification-icon">💬</span>
            <span className="notification-text">{notification}</span>
            <button className="notification-close" onClick={() => setNotification(null)}>×</button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-header">
          <h3>Dashboard Statistics</h3>
        </div>
        <div className="stats-grid">
          {getStatsArray(stats).map(stat => (
            <div key={stat.key} className={`stat-card ${stat.key}`} style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'none',
              transform: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{stat.icon}</span>
                  <p style={{ 
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    margin: '0',
                    color: '#333'
                  }}>{stat.value}</p>
                </div>
                <div style={{ fontSize: '0.85rem', margin: '0', color: '#666', fontWeight: 'normal', textAlign: 'center', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Section */}
      <div className="action-section">
        <div className="action-buttons">
          <button 
            className="submit-ticket-btn" 
            onClick={() => setShowForm(!showForm)}
          >
            New Ticket
          </button>
        </div>
      </div>

      {/* New Ticket Form Popup */}
      {showForm && (
        <div 
          className="form-popup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <UserForm user={currentUser} onSubmit={handleTicketSubmitted} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Section Title - Above Table */}
      <div className="table-section-title">
        <h2 className="section-title">Your Tickets & Conversations</h2>
      </div>

      {/* Tickets Section - Table Structure */}
      <div className="tickets-section">
        <div className="section-subtitle">
          {tickets.length > 0 && (
            <>
              {`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
              <span className="current-sort-info">
                • Sorted by: <strong>{sortConfig.key === 'created_at' ? 'Date' : 
                  sortConfig.key === 'status' ? 'Status' : 
                  sortConfig.key === 'priority' ? 'Priority' : 
                  sortConfig.key === 'issue_title' ? 'Title' : 
                  sortConfig.key === 'issue_type' ? 'Type' : sortConfig.key}</strong> 
                ({sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'})
              </span>
            </>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your tickets...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h3>Error Loading Tickets</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={retryFetch}>
              🔄 Try Again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tickets yet</h3>
            <p>Submit your first ticket to get started!</p>
          </div>
        ) : (
          <>
            {/* Tickets Sorting Header */}
            <div className="tickets-sort-header">
              <div className="sort-controls">
                <span className="sort-label">Sort tickets by:</span>
                <button 
                  className={`sort-btn ${sortConfig.key === 'created_at' ? 'active' : ''}`}
                  onClick={() => handleSort('created_at')}
                >
                  Date {getSortIcon('created_at')}
                </button>
                <button 
                  className={`sort-btn ${sortConfig.key === 'status' ? 'active' : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </button>
                <button 
                  className={`sort-btn ${sortConfig.key === 'priority' ? 'active' : ''}`}
                  onClick={() => handleSort('priority')}
                >
                  Priority {getSortIcon('priority')}
                </button>
                <button 
                  className={`sort-btn ${sortConfig.key === 'issue_title' ? 'active' : ''}`}
                  onClick={() => handleSort('issue_title')}
                >
                  Title {getSortIcon('issue_title')}
                </button>
                <button 
                  className={`sort-btn ${sortConfig.key === 'issue_type' ? 'active' : ''}`}
                  onClick={() => handleSort('issue_type')}
                >
                  Type {getSortIcon('issue_type')}
                </button>
              </div>
            </div>
            
            {/* Table Structure */}
            <div className="ticket-table-container">
              <div className="ticket-table">
                <div className="table-header">
                  <div className="header-cell sortable" onClick={() => handleSort('id')}>
                    TICKET NO
                    <span className="sort-icon">{getSortIcon('id')}</span>
                  </div>
                  <div className="header-cell sortable" onClick={() => handleSort('issue_title')}>
                    ISSUE NAME
                    <span className="sort-icon">{getSortIcon('issue_title')}</span>
                  </div>
                  <div className="header-cell sortable" onClick={() => handleSort('product')}>
                    PRODUCT
                    <span className="sort-icon">{getSortIcon('product')}</span>
                  </div>
                  <div className="header-cell sortable" onClick={() => handleSort('created_at')}>
                    SLA TIMER
                    <span className="sort-icon">{getSortIcon('created_at')}</span>
                  </div>
                  <div className="header-cell">ACTIONS</div>
                </div>

                <div className="table-body">
                  {sortTickets(tickets)
                    .filter(ticket => ticket && ticket.id) // Filter out invalid tickets
                    .map(ticket => (
                    <div key={ticket.id} className="table-row">
                      <div className="table-cell">
                        <div className="ticket-number">
                          #{ticket.id}
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="ticket-title-cell">
                          <div className="ticket-title">{ticket.issue_title || 'Untitled Ticket'}</div>
                          {ticket.description && (
                            <div className="ticket-description-preview">
                              {ticket.description.length > 60 
                                ? `${ticket.description.substring(0, 60)}...` 
                                : ticket.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="product-badge">
                          {ticket.product || 'N/A'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <SLATimerIndicator ticket={ticket} />
                      </div>
                      <div className="table-cell actions-cell">
                        <button 
                          className="expand-btn"
                          onClick={() => openChatModal(ticket)}
                          title="Open Support Chat"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 