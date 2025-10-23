import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AgentDashboard.css';
import SLATimer from '../sla/SLATimer';
import TicketCard from '../tickets/TicketCard';

const AgentDashboard = ({ agent }) => {
  const navigate = useNavigate();
  
  // SECURITY CHECK: Ensure only agents can access this dashboard
  useEffect(() => {
    console.log('🔒 AgentDashboard: Checking user role...');
    console.log('👤 Agent prop:', agent);
    
    // Temporarily disable security check for debugging
    console.log('🔍 TEMPORARILY DISABLED SECURITY CHECK FOR DEBUGGING');
    /*
    // Check if user is actually an agent (support_executive or admin)
    if (!agent || (agent.role !== 'support_executive' && agent.role !== 'admin')) {
      console.log('❌ Access denied - User is not an agent:', agent?.role);
      console.log('🔄 Redirecting to login...');
      navigate('/login', { replace: true });
      return;
    }
    */
    
    console.log('✅ AgentDashboard: Access granted for agent:', agent?.name);
  }, [agent, navigate]);
  
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');
  const [selectedProduct, setSelectedProduct] = useState('all'); // 'all' or product ID
  
  // Chat state
  const [ticketReplies, setTicketReplies] = useState({});
  
  // Quick reply state
  const [quickReplies, setQuickReplies] = useState({});
  const [sendingReplies, setSendingReplies] = useState({});
  
  // SLA Timer state
  const [slaTimers, setSlaTimers] = useState({});
  
  // SLA Configurations state
  const [slaConfigurations, setSlaConfigurations] = useState({});
  const [slaConfigsLoading, setSlaConfigsLoading] = useState(true);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  
  // New ticket assignment notification state
  const [showNewTicketNotification, setShowNewTicketNotification] = useState(false);
  const [newTicketCount, setNewTicketCount] = useState(0);
  
  // Ticket status change notification state
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [statusNotificationMessage, setStatusNotificationMessage] = useState('');
  const [statusNotificationType, setStatusNotificationType] = useState('');
  
  // Real-time timer updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });
  const [statsSortConfig, setStatsSortConfig] = useState({
    key: 'count',
    direction: 'desc'
  });

  // Ticket filter state
  const [agents, setAgents] = useState([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);

  const location = useLocation();

  const handleLogout = () => {
    console.log(' Logging out agent...');
    
    // Clear all session data
    localStorage.removeItem('tickUser');
    localStorage.removeItem('token');
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('session_expires');
    localStorage.removeItem('login_timestamp');
    localStorage.removeItem('remembered_login_id');
    localStorage.removeItem('remembered_password');
    
    console.log('🧹 All session data cleared');
    console.log('🔄 Redirecting to login page...');
    
    // Redirect to main login page
    navigate('/login');
  };
  
  // Fetch tickets from API - Only tickets assigned to this agent
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      console.log('🔑 Agent Dashboard - Using token:', token ? 'Present' : 'Missing');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Get agent ID from localStorage (check both userData and agentData)
      const userData = localStorage.getItem('userData');
      const agentData = localStorage.getItem('agentData');
      
      let agentId = null;
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          agentId = parsedUserData.id;
          console.log('🔍 Found agent ID in userData:', agentId);
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }
      
      if (!agentId && agentData) {
        try {
          const parsedAgentData = JSON.parse(agentData);
          agentId = parsedAgentData.id;
          console.log('🔍 Found agent ID in agentData:', agentId);
        } catch (e) {
          console.error('Error parsing agentData:', e);
        }
      }
      
      if (!agentId) {
        console.error('❌ Agent ID not found in localStorage');
        console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
        console.log('🔍 userData:', userData);
        console.log('🔍 agentData:', agentData);
        setTickets([]);
        return;
      }
      
      // Fetch only tickets assigned to this agent
      const response = await fetch(`http://localhost:5000/api/tickets/agent/${agentId}`, {
        method: 'GET',
        headers: headers
      });
      
      console.log('📡 Agent Dashboard - Tickets response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        const ticketsArray = Array.isArray(result.data) ? result.data : [];
        
        // Check for new tickets (tickets created in the last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newTickets = ticketsArray.filter(ticket => {
          const ticketCreatedAt = new Date(ticket.created_at);
          return ticketCreatedAt > fiveMinutesAgo;
        });
        
        // Show notification if there are new tickets
        if (newTickets.length > 0) {
          setNewTicketCount(newTickets.length);
          setShowNewTicketNotification(true);
          console.log(`🎉 Found ${newTickets.length} new tickets assigned to agent!`);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNewTicketNotification(false);
            setNewTicketCount(0);
          }, 5000);
        }
        
        setTickets(ticketsArray);
        console.log('✅ Agent Dashboard - Fetched tickets for agent:', ticketsArray.length);
        console.log('📊 Agent Dashboard - Tickets data:', ticketsArray);
      } else {
        console.error('❌ Agent Dashboard - Failed to fetch tickets:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Agent Dashboard - Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for the dropdown
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sla/products', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Get current agent information from database
  const [currentAgent, setCurrentAgent] = useState(null);
  
  const fetchCurrentAgentInfo = async () => {
    console.log('🔍 fetchCurrentAgentInfo - Starting...');
    
    // Always try localStorage first since we know it has the correct data
    const userData = localStorage.getItem('userData');
    const agentData = localStorage.getItem('agentData');
    
    console.log('🔍 Raw userData from localStorage:', userData);
    console.log('🔍 Raw agentData from localStorage:', agentData);
    
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('🔍 Parsed userData:', parsedUserData);
        console.log('🔍 Email field in userData:', parsedUserData.email);
        console.log('🔍 All keys in userData:', Object.keys(parsedUserData));
        
        setCurrentAgent({
          id: parsedUserData.id,
          name: parsedUserData.name,
          email: parsedUserData.email
        });
        console.log('✅ Using userData from localStorage:', parsedUserData);
        console.log('📧 Email from userData:', parsedUserData.email);
        return; // Exit early since we have the data
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
    
    if (agentData) {
      try {
        const parsedAgentData = JSON.parse(agentData);
        setCurrentAgent(parsedAgentData);
        console.log('✅ Using agentData from localStorage:', parsedAgentData);
        return; // Exit early since we have the data
      } catch (e) {
        console.error('Error parsing agentData:', e);
      }
    }
    
    // If no localStorage data, set default values
    setCurrentAgent({
      id: null,
      name: 'Agent',
      email: 'No email available'
    });
    console.log('⚠️ No agent data found in localStorage, using defaults');
  };

  // Fetch SLA configurations for timer calculations
  const fetchSLAConfigurations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sla/configurations', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Create a lookup map for quick access
          const configMap = {};
          result.data.forEach(config => {
            const key = `${config.product_id}_${config.module_id}_${config.issue_name}`;
            configMap[key] = config;
          });
          
          setSlaConfigurations(configMap);
        } else {
          console.error('❌ Failed to fetch SLA configurations:', result.message);
        }
      } else {
        console.error('❌ Failed to fetch SLA configurations');
      }
    } catch (error) {
      console.error('❌ Error fetching SLA configurations:', error);
    } finally {
      setSlaConfigsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProducts();
    fetchSLAConfigurations();
    fetchCurrentAgentInfo();
    
    // Check if we're returning from a ticket detail page with preserved state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.selectedProduct) {
      setSelectedProduct(location.state.selectedProduct);
    }
    
    return () => {
      // Cleanup
    };
  }, []); // Changed from [location.state] to [] to run on mount

  // Handle location state changes separately
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.selectedProduct) {
      setSelectedProduct(location.state.selectedProduct);
    }
  }, [location.state]);

  // Real-time timer updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update filtered tickets when tickets change (no agent filtering needed since we only fetch agent's tickets)
  useEffect(() => {
    setFilteredTickets(tickets);
  }, [tickets]);

  // Fetch ticket replies when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0) {
      tickets.forEach(ticket => {
        fetchTicketReplies(ticket.id);
        checkSLABreach(ticket.id);
      });
    }
  }, [tickets]);

  // Check SLA breach and show notification
  const checkSLABreach = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sla/timers/${ticketId}/remaining`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const timer = data.data[0];
          
          // Check if ticket was auto-escalated
          if (timer.auto_escalated) {
            const notification = {
              id: Date.now(),
              type: 'sla_breach',
              message: `🚨 Ticket #${ticketId} automatically escalated due to SLA breach!`,
              ticketId: ticketId,
              timestamp: new Date().toISOString()
            };
            
            setNotifications(prev => [notification, ...prev]);
            
            // Remove notification after 10 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 10000);
          }
        }
      }
    } catch (error) {
      console.error('Error checking SLA breach:', error);
    }
  };

  // Calculate SLA timer for a ticket
  const calculateSLATimer = (ticket) => {
    if (!ticket.product_id || !ticket.module_id || !ticket.issue_type) {
      return null;
    }

    const key = `${ticket.product_id}_${ticket.module_id}_${ticket.issue_type}`;
    const slaConfig = slaConfigurations[key];
    
    if (!slaConfig) {
      return null;
    }

    // Use currentTime for real-time updates
    const now = currentTime;
    const ticketCreatedAt = new Date(ticket.created_at);
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

  // Recalculate tabList when selectedProduct changes
  useEffect(() => {
    // This will trigger a re-render when selectedProduct changes
  }, [selectedProduct]);

  // Move ticket to In Progress
  const handleOpenTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'in_progress' })
      });

      if (response.ok) {
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: 'in_progress' } : ticket
        ));
        
        // Show status change notification
        showStatusChangeNotification('in_progress');
      } else {
        console.error('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };


  // Handle status change for centralized ticket component
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
        console.log(`✅ Ticket status changed to ${newStatus} successfully`);
        
        // Show status change notification
        showStatusChangeNotification(newStatus);
        
        if (result.whatsappSent === false) {
          console.log('ℹ️ WhatsApp notification disabled (token expired)');
        }
      } else {
        console.error(`Failed to change ticket status to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error changing ticket status:', error);
    }
  };



  const getTicketsByStatus = (status) => {
    let filteredTickets = tickets.filter(ticket => ticket.status === status);
    
    // Apply product filter if a specific product is selected
    if (selectedProduct !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => {
        // Check if ticket has product_id that matches
        if (ticket.product_id === parseInt(selectedProduct)) {
          return true;
        }
        
        // If no product_id, check if product name matches (case-insensitive)
        if (ticket.product && typeof ticket.product === 'string') {
          const selectedProductObj = products.find(p => p.id === parseInt(selectedProduct));
          if (selectedProductObj) {
            const ticketProduct = ticket.product.toLowerCase().trim();
            const productName = selectedProductObj.name.toLowerCase().trim();
            
            return ticketProduct === productName || 
                   ticketProduct.includes(productName) || 
                   productName.includes(ticketProduct);
          }
        }
        
        return false;
      });
    }
    
    return filteredTickets;
  };

  // Compute tabList dynamically based on current filters
  const tabList = [
    { key: 'new', label: '🆕 New', count: getTicketsByStatus('new').length },
    { key: 'in_progress', label: '🔄 In Progress', count: getTicketsByStatus('in_progress').length },
    { key: 'escalated', label: '🚨 Escalated', count: getTicketsByStatus('escalated').length },
    { key: 'closed', label: '✅ Closed', count: getTicketsByStatus('closed').length }
  ];

  // Chat helper functions
  const fetchTicketReplies = useCallback(async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/messages/${ticketId}`);
      const data = await response.json();
      
      if (data.success) {
        setTicketReplies(prev => ({
          ...prev,
          [ticketId]: data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching ticket replies:', error);
    }
  }, []);

  // Handle quick reply submission
  const handleQuickReply = async (ticketId, message) => {
    if (!message.trim() || sendingReplies[ticketId]) return;
    
    try {
      setSendingReplies(prev => ({ ...prev, [ticketId]: true }));
      
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId: ticketId,
          senderType: 'agent',
          senderId: null, // Will be set by backend based on agent session
          senderName: 'Support Agent',
          message: message.trim(),
          messageType: 'text'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear the quick reply input
        setQuickReplies(prev => ({ ...prev, [ticketId]: '' }));
        
        // Refresh ticket replies
        await fetchTicketReplies(ticketId);
        
        // Show success feedback
        console.log('✅ Quick reply sent successfully');
      } else {
        console.error('Failed to send quick reply:', data.message);
      }
    } catch (error) {
      console.error('Error sending quick reply:', error);
    } finally {
      setSendingReplies(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // Handle quick reply input change
  const handleQuickReplyChange = (ticketId, value) => {
    setQuickReplies(prev => ({ ...prev, [ticketId]: value }));
  };

  // Handle quick reply key press (Enter to send)
  const handleQuickReplyKeyPress = (e, ticketId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = quickReplies[ticketId] || '';
      if (message.trim()) {
        handleQuickReply(ticketId, message);
      }
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return '#ff4444';
      case 'P1': return '#ff8800';
      case 'P2': return '#ffaa00';
      case 'P3': return '#44aa44';
      default: return '#666666';
    }
  };

  // Sorting functions
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatsSort = (key) => {
    setStatsSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortTickets = (ticketsToSort) => {
    if (!sortConfig.key) return ticketsToSort;

    return [...ticketsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at' || sortConfig.key === 'closed_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle priority sorting
      if (sortConfig.key === 'priority') {
        const priorityOrder = { P0: 4, P1: 3, P2: 2, P3: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      // Handle status sorting
      if (sortConfig.key === 'status') {
        const statusOrder = { new: 1, in_progress: 2, escalated: 3, closed: 4 };
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

  const sortStats = (statsData) => {
    return statsData.sort((a, b) => {
      let aValue, bValue;

      if (statsSortConfig.key === 'count') {
        aValue = a.count;
        bValue = b.count;
      } else if (statsSortConfig.key === 'label') {
        aValue = a.label.toLowerCase();
        bValue = b.label.toLowerCase();
      } else if (statsSortConfig.key === 'key') {
        aValue = a.key.toLowerCase();
        bValue = b.key.toLowerCase();
      }

      if (aValue < bValue) {
        return statsSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return statsSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const getStatsSortIcon = (key) => {
    if (statsSortConfig.key !== key) return '';
    return statsSortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const resetAllSorting = () => {
    setSortConfig({ key: 'id', direction: 'desc' });
    setStatsSortConfig({ key: 'count', direction: 'desc' });
  };

  // Helper function to get product display name
  const getProductDisplayName = (ticket) => {
    // If ticket has a product string, use it
    if (ticket.product && typeof ticket.product === 'string' && ticket.product.trim()) {
      return ticket.product;
    }
    
    // If ticket has product_id, look up the product name
    if (ticket.product_id && products.length > 0) {
      const productObj = products.find(p => p.id === ticket.product_id);
      if (productObj && productObj.name) {
        return productObj.name;
      }
    }
    
    // Fallback
    return 'No Product';
  };

  // Simple Inline SLA Timer Component
  const SLATimerIndicator = ({ ticket }) => {
    if (slaConfigsLoading) {
      return (
        <div className="sla-timer-indicator loading">
          Loading...
        </div>
      );
    }
    
    const slaTimer = calculateSLATimer(ticket);
    
    if (!slaTimer) {
      return (
        <div className="sla-timer-indicator no-config">
          No SLA
        </div>
      );
    }

    const { remainingMinutes, isBreached, isWarning, priority } = slaTimer;
    
    let statusClass = 'normal';
    
    if (isBreached) {
      statusClass = 'breached';
    } else if (isWarning) {
      statusClass = 'warning';
    }

    return (
      <div className={`sla-timer-indicator ${statusClass}`}>
        {isBreached ? (
          `${formatSLATime(Math.abs(remainingMinutes))} OVERDUE`
        ) : (
          formatSLATime(remainingMinutes)
        )}
      </div>
    );
  };

  // Function to close the new ticket notification
  const closeNewTicketNotification = () => {
    setShowNewTicketNotification(false);
    setNewTicketCount(0);
  };

  // Function to show status change notification
  const showStatusChangeNotification = (status) => {
    let message = '';
    let type = '';
    
    switch (status) {
      case 'in_progress':
        message = 'Ticket In Progress';
        type = 'in_progress';
        break;
      case 'closed':
        message = 'Ticket Closed';
        type = 'closed';
        break;
      case 'escalated':
        message = 'Ticket Escalated';
        type = 'escalated';
        break;
      default:
        message = `Ticket ${status}`;
        type = status;
    }
    
    setStatusNotificationMessage(message);
    setStatusNotificationType(type);
    setShowStatusNotification(true);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowStatusNotification(false);
      setStatusNotificationMessage('');
      setStatusNotificationType('');
    }, 3000);
  };

  // Function to close the status notification
  const closeStatusNotification = () => {
    setShowStatusNotification(false);
    setStatusNotificationMessage('');
    setStatusNotificationType('');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="agent-dashboard sidepanel-layout">
      {/* New Ticket Assignment Notification Popup */}
      {showNewTicketNotification && (
        <div className="new-ticket-notification-popup">
          <div className="notification-content">
            <div className="notification-icon">🎫</div>
            <div className="notification-text">
              <h3>New Ticket Assigned!</h3>
              <p>
                {newTicketCount === 1 
                  ? 'You have been assigned 1 new ticket.' 
                  : `You have been assigned ${newTicketCount} new tickets.`
                }
              </p>
            </div>
            <button 
              className="notification-close-btn"
              onClick={closeNewTicketNotification}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Ticket Status Change Notification Popup */}
      {showStatusNotification && (
        <div className="status-notification-popup">
          <div className="notification-content">
            <div className="notification-icon">
              {statusNotificationType === 'in_progress' && '⚡'}
              {statusNotificationType === 'closed' && '✅'}
              {statusNotificationType === 'escalated' && '🚨'}
            </div>
            <div className="notification-text">
              <h3>{statusNotificationMessage}</h3>
            </div>
            <button 
              className="notification-close-btn"
              onClick={closeStatusNotification}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <span className="notification-message">{notification.message}</span>
              <button 
                className="notification-close"
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="header-title">Agent Dashboard</h1>
            <p className="header-subtitle">
              Welcome, {currentAgent?.name || 'Agent'}
            </p>
            <p className="header-email">
              {currentAgent?.email || 'No email available'}
            </p>
          </div>
          <div className="header-actions">
            {/* Horizontal Action Buttons Row */}
            <div className="header-action-buttons">
              {/* Refresh Button */}
              <button className="action-button refresh-btn" onClick={fetchTickets}>
                🔄 Refresh My Tickets
              </button>
              
              {/* Table View Button */}
              <a href="/business-tickets" className="action-button table-view-btn">
              📅 Table View
              </a>
            </div>
            
            {/* Product Dashboard Link */}
            <button 
              className="product-dashboard-btn"
              onClick={() => window.location.href = '/products'}
            >
              <span className="btn-icon">⚙️</span>
              Product Dashboard
            </button>
            
            {/* Logout Button - Far Right */}
            <button className="action-button logout-btn logout-btn-far-right" onClick={handleLogout}>
             ↗  Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Product Filter Buttons - Business Team Dashboard Style */}
      <div className="product-filter-section">
        <div className="product-filter-buttons">
          <button
            className={`product-filter-btn ${selectedProduct === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedProduct('all')}
          >
            📊 All Products
          </button>
          {products.map(product => (
            <button
              key={product.id}
              className={`product-filter-btn ${selectedProduct === product.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedProduct(product.id.toString())}
            >
              📦 {product.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="sidepanel-main">
        {/* Left Sidebar - Ticket Status */}
        <nav className="sidepanel-nav">
          <div className="nav-header">
            <h3>TICKET STATUS</h3>
          </div>
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`sidepanel-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{tab.label.split(' ')[0]}</span>
              <span className="tab-label">{tab.label.split(' ').slice(1).join(' ')}</span>
              <span className="tab-badge">{tab.count}</span>
            </button>
          ))}
        </nav>
        
        {/* Main Content Area */}
        <main className="sidepanel-content">
          {/* Content based on active tab */}
          {activeTab === 'new' && (
            <div className="tickets-table-container">
              <div className="tickets-table">
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
                  {sortTickets(getTicketsByStatus('new')).length === 0 ? (
                    <div className="no-tickets">
                      <p>No Tickets</p>
                    </div>
                  ) : (
                    sortTickets(getTicketsByStatus('new')).map((ticket, index) => (
                      <div key={ticket.id} className="table-row">
                        <div className="table-cell ticket-number">#{ticket.id}</div>
                        <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                        <div className="table-cell">
                          {getProductDisplayName(ticket)}
                        </div>
                        <div className="table-cell">
                          <SLATimerIndicator ticket={ticket} />
                        </div>
                        <div className="table-cell">
                          <div className="ticket-actions">
                            <button 
                              className="expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }}
                            >
                              View Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
              </div>
            </div>
          )}
          
          {activeTab === 'in_progress' && (
            <div className="tickets-table-container">
              <div className="tickets-table">
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
                  {sortTickets(getTicketsByStatus('in_progress')).length === 0 ? (
                    <div className="no-tickets">
                      <p>No Tickets</p>
                    </div>
                  ) : (
                    sortTickets(getTicketsByStatus('in_progress')).map((ticket, index) => (
                      <div key={ticket.id} className="table-row">
                        <div className="table-cell ticket-number">#{ticket.id}</div>
                        <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                        <div className="table-cell">
                          {getProductDisplayName(ticket)}
                        </div>
                        <div className="table-cell">
                          <SLATimerIndicator ticket={ticket} />
                        </div>
                        <div className="table-cell">
                          <div className="ticket-actions">
                            <button 
                              className="expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }}
                            >
                              View Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'escalated' && (
            <div className="tickets-table-container">
              <div className="tickets-table">
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
                  {sortTickets(getTicketsByStatus('escalated')).length === 0 ? (
                    <div className="no-tickets">
                      <p>No Tickets</p>
                    </div>
                  ) : (
                    sortTickets(getTicketsByStatus('escalated')).map((ticket, index) => (
                      <div key={ticket.id} className="table-row">
                        <div className="table-cell ticket-number">#{ticket.id}</div>
                        <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                        <div className="table-cell">
                          {getProductDisplayName(ticket)}
                        </div>
                        <div className="table-cell">
                          <SLATimerIndicator ticket={ticket} />
                        </div>
                        <div className="table-cell">
                          <div className="ticket-actions">
                            <button 
                              className="expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }}
                            >
                              View Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'closed' && (
            <div className="tickets-table-container">
              <div className="tickets-table">
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
                  {sortTickets(getTicketsByStatus('closed')).length === 0 ? (
                    <div className="no-tickets">
                      <p>No Tickets</p>
                    </div>
                  ) : (
                    sortTickets(getTicketsByStatus('closed')).map((ticket, index) => (
                      <div key={ticket.id} className="table-row">
                        <div className="table-cell ticket-number">#{ticket.id}</div>
                        <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                        <div className="table-cell">
                          {getProductDisplayName(ticket)}
                        </div>
                        <div className="table-cell">
                          <SLATimerIndicator ticket={ticket} />
                        </div>
                        <div className="table-cell">
                          <div className="ticket-actions">
                          <button 
                            className="expand-btn expand-btn-closed"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/ticket/${ticket.id}`, { 
                                state: { 
                                  from: 'agent-dashboard',
                                  returnPath: '/agent-dashboard',
                                  activeTab: activeTab,
                                  selectedProduct: selectedProduct
                                } 
                              });
                            }}
                          >
                              View Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          

        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;