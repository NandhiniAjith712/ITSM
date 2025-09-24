import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import './AgentDashboard.css';
import SLATimer from './SLATimer';
import TicketCard from './TicketCard';

const AgentDashboard = () => {
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

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    console.log('🚪 Logging out agent...');
    
    // Clear all session data
    localStorage.removeItem('tickUser');
    localStorage.removeItem('token');
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    
    console.log('🧹 All session data cleared');
    console.log('🔄 Redirecting to login page...');
    
    // Redirect to main login page
    navigate('/login');
  };
  
  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/tickets'));
      if (response.ok) {
        const result = await response.json();
        setTickets(result.data);
      } else {
        console.error('Failed to fetch tickets');
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
      const response = await fetch(buildApiUrl('/api/sla/products'));
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

  // Fetch agents for ticket filtering
  const fetchAgents = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/agents?role=support_executive'));
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const sortedAgents = result.data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setAgents(sortedAgents);
        }
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Filter tickets by selected agent
  const filterTicketsByAgent = (agentId) => {
    setSelectedAgentFilter(agentId);
    if (!agentId) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => ticket.assigned_to === parseInt(agentId));
      setFilteredTickets(filtered);
    }
  };

  // Fetch SLA configurations for timer calculations
  const fetchSLAConfigurations = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/sla/configurations'));
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
    console.log('🔍 AgentDashboard mounted - Updated Version');
    fetchTickets();
    fetchProducts();
    fetchAgents();
    fetchSLAConfigurations();
    
    // Check if we're returning from a ticket detail page with preserved state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.selectedProduct) {
      setSelectedProduct(location.state.selectedProduct);
    }
    
    return () => {
      console.log('🔍 AgentDashboard unmounting');
    };
  }, [location.state]);

  // Real-time timer updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update filtered tickets when tickets or filters change
  useEffect(() => {
    if (selectedAgentFilter) {
      const filtered = tickets.filter(ticket => ticket.assigned_to === parseInt(selectedAgentFilter));
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets(tickets);
    }
  }, [tickets, selectedAgentFilter]);

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
      const response = await fetch(buildApiUrl(`/api/sla/timers/${ticketId}/remaining`));
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
      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}/status`), {
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
      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}/status`), {
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
    
    // Apply agent filter if a specific agent is selected
    if (selectedAgentFilter) {
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.assigned_to === parseInt(selectedAgentFilter)
      );
    }
    
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

  // Debug: Log ticket counts
  console.log('Current tickets state:', tickets.length);
  console.log('Selected product:', selectedProduct);
  console.log('Tab counts:', tabList.map(tab => `${tab.label}: ${tab.count}`));

  // Chat helper functions
  const fetchTicketReplies = useCallback(async (ticketId) => {
    try {
      const response = await fetch(buildApiUrl(`/api/chat/messages/${ticketId}`));
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
      
      const response = await fetch(buildApiUrl('/api/chat/messages'), {
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
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getStatsSortIcon = (key) => {
    if (statsSortConfig.key !== key) return '↕️';
    return statsSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const resetAllSorting = () => {
    setSortConfig({ key: 'id', direction: 'desc' });
    setStatsSortConfig({ key: 'count', direction: 'desc' });
  };

  // Simple Inline SLA Timer Component
  const SLATimerIndicator = ({ ticket }) => {
    if (slaConfigsLoading) {
      return (
        <div className="sla-timer-inline loading">
          <span>⏳ Loading...</span>
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

    const { remainingMinutes, isBreached, isWarning, priority } = slaTimer;
    
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
            <h1 className="header-title">🎫 Agent Dashboard</h1>
            <p className="header-subtitle">Manage Tickets, SLA Settings, and Product Filters</p>
          </div>
          <div className="header-actions">
            <div className="action-buttons-group">
              <button className="refresh-btn" onClick={fetchTickets}>
                🔄 Refresh Tickets
              </button>
              <a href="/tickets-table" className="table-view-link">📊 Table View</a>
              <button className="logout-btn" onClick={handleLogout}>
                ↗ Logout
              </button>
            </div>
            <a href="/products" className="product-dashboard-link">📊 Product Dashboard</a>
          </div>
        </div>
      </header>
      
      {/* Ticket Filter Section */}
      <div className="ticket-filter-section">
        <div className="filter-header">
          <h3>🎫 Filter Tickets by Agent</h3>
          <p>View tickets assigned to specific agents (support executives only)</p>
        </div>
        
                    <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="agentFilter">Select Agent:</label>
                <select
                  id="agentFilter"
                  value={selectedAgentFilter}
                  onChange={(e) => filterTicketsByAgent(e.target.value)}
                  className="agent-filter-select"
                >
                  <option value="">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
                {selectedAgentFilter && (
                  <button
                    className="clear-filter-btn"
                    onClick={() => filterTicketsByAgent('')}
                    title="Clear agent filter"
                  >
                    ❌ Clear Filter
                  </button>
                )}
              </div>
          
          <div className="filter-stats">
            <span className="stat-item">
              📊 Total Tickets: <strong>{tickets.length}</strong>
            </span>
            <span className="stat-item">
              🔍 Filtered Tickets: <strong>{filteredTickets.length}</strong>
            </span>
            {selectedAgentFilter && (
              <span className="stat-item">
                👤 Selected Agent: <strong>
                  {agents.find(a => a.id === parseInt(selectedAgentFilter))?.name || 'Unknown'}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>

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
          {/* Tickets Found Message */}
          <div className="tickets-found-message">
            <span>
              {selectedAgentFilter 
                ? `${filteredTickets.length} tickets found for selected agent`
                : `${tickets.length} tickets found`
              }
            </span>
            {selectedAgentFilter && (
              <span className="agent-filter-indicator">
                👤 Filtered by: {agents.find(a => a.id === parseInt(selectedAgentFilter))?.name || 'Unknown'}
              </span>
            )}
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'new' && (
            <div className="tickets-table-container">
              <div className="tickets-found-message">
                <span>{getTicketsByStatus('new').length} new tickets found</span>
              </div>
              
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
                  {sortTickets(getTicketsByStatus('new')).map((ticket, index) => (
                    <div key={ticket.id} className="table-row">
                      <div className="table-cell ticket-number">#{ticket.id}</div>
                      <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                      <div className="table-cell">
                        <span className="product-badge">{ticket.product}</span>
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
                              if (activeTab === 'new') {
                                // Move ticket to In Progress
                                handleOpenTicket(ticket.id);
                              } else {
                                // Open ticket details
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }
                            }}
                          >
                            {activeTab === 'new' ? '▶️' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'in_progress' && (
            <div className="tickets-table-container">
              <div className="tickets-found-message">
                <span>{getTicketsByStatus('in_progress').length} in progress tickets found</span>
              </div>
              
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
                  {sortTickets(getTicketsByStatus('in_progress')).map((ticket, index) => (
                    <div key={ticket.id} className="table-row">
                      <div className="table-cell ticket-number">#{ticket.id}</div>
                      <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                      <div className="table-cell">
                        <span className="product-badge">{ticket.product}</span>
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
                              if (activeTab === 'new') {
                                // Move ticket to In Progress
                                handleOpenTicket(ticket.id);
                              } else {
                                // Open ticket details
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }
                            }}
                          >
                            {activeTab === 'new' ? '▶️' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'escalated' && (
            <div className="tickets-table-container">
              <div className="tickets-found-message">
                <span>{getTicketsByStatus('escalated').length} escalated tickets found</span>
                <div className="escalated-notice">
                  <p>⚠️ These tickets have already breached their SLA. Please address them promptly.</p>
                </div>
              </div>
              
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
                  {sortTickets(getTicketsByStatus('escalated')).map((ticket, index) => (
                    <div key={ticket.id} className="table-row">
                      <div className="table-cell ticket-number">#{ticket.id}</div>
                      <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                      <div className="table-cell">
                        <span className="product-badge">{ticket.product}</span>
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
                              if (activeTab === 'new') {
                                // Move ticket to In Progress
                                handleOpenTicket(ticket.id);
                              } else {
                                // Open ticket details
                                navigate(`/ticket/${ticket.id}`, { 
                                  state: { 
                                    from: 'agent-dashboard',
                                    returnPath: '/agent-dashboard',
                                    activeTab: activeTab,
                                    selectedProduct: selectedProduct
                                  } 
                                });
                              }
                            }}
                          >
                            {activeTab === 'new' ? '▶️' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'closed' && (
            <div className="tickets-table-container">
              <div className="tickets-found-message">
                <span>{getTicketsByStatus('closed').length} closed tickets found</span>
              </div>
              
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
                  {sortTickets(getTicketsByStatus('closed')).map((ticket, index) => (
                    <div key={ticket.id} className="table-row">
                      <div className="table-cell ticket-number">#{ticket.id}</div>
                      <div className="table-cell issue-title">{ticket.issue_title || 'No Title'}</div>
                      <div className="table-cell">
                        <span className="product-badge">{ticket.product}</span>
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
                              if (activeTab === 'new') {
                                // Move ticket to In Progress
                                handleOpenTicket(ticket.id);
                              } else {
                                // Open ticket details
                                navigate(`/ticket/${ticket.id}`);
                              }
                            }}
                          >
                            {activeTab === 'new' ? '▶️' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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