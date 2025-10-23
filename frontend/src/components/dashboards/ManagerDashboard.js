import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';
import SLATimer from '../sla/SLATimer';
import TicketCard from '../tickets/TicketCard';

const ManagerDashboard = ({ manager }) => {
  const navigate = useNavigate();
  
  // SECURITY CHECK: Ensure only managers can access this dashboard
  useEffect(() => {
    console.log('🔒 ManagerDashboard: Checking user role...');
    console.log('👤 Manager prop:', manager);
    
    // Check if user is actually a manager (support_manager)
    if (!manager || manager.role !== 'support_manager') {
      console.log(' Access denied - User is not a manager:', manager?.role);
      console.log('🔄 Redirecting to login...');
      navigate('/login', { replace: true });
      return;
    }
    
    console.log('✅ ManagerDashboard: Access granted for manager:', manager.name);
  }, [manager, navigate]);
  const [tickets, setTickets] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [openMediaId, setOpenMediaId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplies, setTicketReplies] = useState({});
  
  // Escalated ticket detail view state
  const [selectedEscalatedTicket, setSelectedEscalatedTicket] = useState(null);
  const [escalatedTicketView, setEscalatedTicketView] = useState('ticket'); // 'ticket' or 'chat'
  
  // Closed ticket detail view state
  const [selectedClosedTicket, setSelectedClosedTicket] = useState(null);
  const [closedTicketView, setClosedTicketView] = useState('ticket'); // 'ticket' or 'chat'
  
  // Reply functionality state
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedTicketForReply, setSelectedTicketForReply] = useState(null);
  const [buttonToggle, setButtonToggle] = useState(false); // For button color toggle
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: 0,
    teamPerformance: []
  });

  // Sorting state variables for escalated tickets table
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Sorting state variables for closed tickets table
  const [closedSortField, setClosedSortField] = useState(null);
  const [closedSortDirection, setClosedSortDirection] = useState('asc');

  // Sorting function for escalated tickets
  const sortTickets = (tickets, field, direction) => {
    if (!field) return tickets;
    
    return [...tickets].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle product sorting by name
      if (field === 'product_id') {
        aValue = getProductName(a.product_id);
        bValue = getProductName(b.product_id);
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return direction === 'asc' ? 1 : -1;
      if (!bValue) return direction === 'asc' ? -1 : 1;
      
      // Sort comparison
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle sort click for escalated tickets table
  const handleSort = (field) => {
    if (sortField === field) {
      // Same field clicked - toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorting function for closed tickets
  const sortClosedTickets = (tickets, field, direction) => {
    if (!field) return tickets;
    
    return [...tickets].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle product sorting by name
      if (field === 'product_id') {
        aValue = getProductName(a.product_id);
        bValue = getProductName(b.product_id);
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return direction === 'asc' ? 1 : -1;
      if (!bValue) return direction === 'asc' ? -1 : 1;
      
      // Sort comparison
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle sort click for closed tickets table
  const handleClosedSort = (field) => {
    if (closedSortField === field) {
      // Same field clicked - toggle direction
      setClosedSortDirection(closedSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setClosedSortField(field);
      setClosedSortDirection('asc');
    }
  };

  // Fetch tickets and team data
  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setIsRefreshing(true);
      
      // Get authentication token
      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      console.log('🔑 Using token for data fetch:', token ? 'Present' : 'Missing');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch tickets
      const ticketsResponse = await fetch('http://localhost:5000/api/tickets', {
        method: 'GET',
        headers: headers
      });
      
      console.log('📡 Tickets response status:', ticketsResponse.status);
      
      let ticketsData = [];
      if (ticketsResponse.ok) {
        const result = await ticketsResponse.json();
        ticketsData = result.data || [];
        setTickets(ticketsData);
        console.log(' Fetched tickets:', ticketsData.length);
      } else {
        console.error(' Failed to fetch tickets:', ticketsResponse.status);
      }

      // Fetch team members (support executives) from agents table
      const teamResponse = await fetch('http://localhost:5000/api/agents', {
        method: 'GET',
        headers: headers
      });
      
      console.log('📡 Team response status:', teamResponse.status);
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const teamMembersData = teamData.data || [];
        setTeamMembers(teamMembersData);
        console.log('✅ Fetched team members:', teamMembersData.length);
        
        // Debug: Log all team members and their roles immediately
        console.log('🔍 All team members with roles:', teamMembersData.map(m => ({ 
          id: m.id, 
          name: m.name, 
          role: m.role,
          email: m.email 
        })));
        
        // Calculate performance metrics with the fetched data
        calculatePerformanceMetrics(ticketsData, teamMembersData);
      } else {
        console.error('❌ Failed to fetch team members:', teamResponse.status);
      }
      
      // For refresh operations, keep the refreshing state for 1 second
      if (isRefresh) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(' Error fetching data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculatePerformanceMetrics = (ticketsData, teamMembersData) => {
    console.log('🔄 calculatePerformanceMetrics called with:');
    console.log('  - ticketsData length:', ticketsData?.length || 0);
    console.log('  - teamMembersData length:', teamMembersData?.length || 0);
    
    const totalTickets = ticketsData.length;
    const resolvedTickets = ticketsData.filter(t => t.status === 'closed').length;
    const avgResolutionTime = totalTickets > 0 ? 
      ticketsData.reduce((acc, ticket) => {
        if (ticket.resolution_time) acc += ticket.resolution_time;
        return acc;
      }, 0) / totalTickets : 0;

    // Debug: Log all team members and their roles
    console.log('🔍 All team members:', teamMembersData.map(m => ({ id: m.id, name: m.name, role: m.role })));

    // Filter for support executives - using actual roles from the system
    const supportExecutives = teamMembersData.filter(member => 
      member.role === 'agent' ||  // Support executives have 'agent' role in this system
      member.role === 'support_executive' || 
      member.role === 'Support Executive'
    );

    console.log('👥 Support executives found:', supportExecutives.length);
    console.log('📊 Support executives:', supportExecutives.map(m => ({ id: m.id, name: m.name, role: m.role })));

    const teamPerformanceData = supportExecutives.map(member => ({
      ...member,
      assignedTickets: ticketsData.filter(t => t.assigned_to === member.id).length,
      resolvedTickets: ticketsData.filter(t => t.assigned_to === member.id && t.status === 'closed').length
    }));

    console.log('📈 Final team performance data:', teamPerformanceData);

    setPerformanceMetrics({
      totalTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime),
      teamPerformance: teamPerformanceData
    });
  };

  // Function to recalculate metrics when tickets change
  const recalculateMetrics = () => {
    console.log('🔄 recalculateMetrics called');
    console.log('  - tickets.length:', tickets.length);
    console.log('  - teamMembers.length:', teamMembers.length);
    
    if (tickets.length > 0 && teamMembers.length > 0) {
      console.log('✅ Conditions met, calling calculatePerformanceMetrics');
      calculatePerformanceMetrics(tickets, teamMembers);
    } else {
      console.log('❌ Conditions not met for recalculateMetrics');
    }
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  // Fetch ticket replies when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0) {
      tickets.forEach(ticket => {
        fetchTicketReplies(ticket.id);
      });
    }
  }, [tickets]);

  // Refresh data when analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchData();
    }
  }, [activeTab]);

  // Recalculate metrics whenever tickets change
  useEffect(() => {
    console.log('🔄 useEffect triggered for tickets/teamMembers change');
    console.log('  - tickets.length:', tickets.length);
    console.log('  - teamMembers.length:', teamMembers.length);
    
    if (tickets.length > 0 && teamMembers.length > 0) {
      console.log('✅ useEffect conditions met, calling recalculateMetrics');
      recalculateMetrics();
    } else {
      console.log('❌ useEffect conditions not met');
    }
  }, [tickets, teamMembers]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'closed' })
      });

      if (response.ok) {
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
        ));
        console.log('✅ Ticket resolved successfully');
        
        // Recalculate performance metrics after status change
        setTimeout(() => {
          calculatePerformanceMetrics(tickets, teamMembers);
        }, 100);
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };

  // Handle status change for centralized ticket component
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTickets(prev => prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
        console.log(`✅ Ticket status changed to ${newStatus} successfully`);
        // Refresh data to show updated status
        fetchData();
      } else {
        console.error(` Failed to change ticket status to ${newStatus}:`, response.status);
      }
    } catch (error) {
      console.error(' Error changing ticket status:', error);
    }
  };

  // Reply functionality
  const toggleReplyForm = (ticket = null) => {
    if (ticket) {
      setSelectedTicketForReply(ticket);
      setShowReplyForm(true);
      setReplyText('');
      setButtonToggle(false); // Reset button toggle when opening form
    } else {
      setShowReplyForm(false);
      setSelectedTicketForReply(null);
      setReplyText('');
      setButtonToggle(false); // Reset button toggle when closing form
    }
  };

  // Handle cancel button click with toggle effect
  const handleCancelClick = () => {
    setButtonToggle(!buttonToggle);
    // Close the form after a short delay to show the toggle effect
    setTimeout(() => {
      toggleReplyForm();
    }, 200);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedTicketForReply) {
      alert('Please enter a reply message');
      return;
    }

    setSendingReply(true);

    try {
      const payload = {
        ticket_id: selectedTicketForReply.id,
        message: replyText.trim(),
        agent_id: localStorage.getItem('agentData') ? JSON.parse(localStorage.getItem('agentData')).id : null
      };

      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/replies/dashboard', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Reply sent successfully:', result);
        
        // Clear reply form
        setReplyText('');
        setShowReplyForm(false);
        setSelectedTicketForReply(null);
        
        // Refresh data
        fetchData();
        
        // Show success message
        alert('Reply sent successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to send reply:', errorData);
        alert(`Failed to send reply: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(`Error sending reply: ${error.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  // Fetch products for product names
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/sla/products', {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
          console.log('✅ Fetched products:', result.data.length);
        }
      } else {
        console.error(' Failed to fetch products:', response.status);
      }
    } catch (error) {
      console.error(' Error fetching products:', error);
    }
  };

  // Function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
  };

  const getTicketsByStatus = (status) => {
    const filteredTickets = tickets.filter(ticket => ticket.status === status);
    console.log(`🔍 Filtering tickets by status '${status}':`, filteredTickets.length, 'found');
    console.log('   All tickets statuses:', tickets.map(t => ({ id: t.id, status: t.status })));
    return filteredTickets;
  };

  // Function to open ticket in new window
  const openTicketWindow = (ticket) => {
    const ticketUrl = `/ticket/${ticket.id}`;
    window.open(ticketUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  // Function to handle escalated ticket view
  const handleEscalatedTicketView = (ticket) => {
    setSelectedEscalatedTicket(ticket);
    setEscalatedTicketView('ticket');
    // Fetch ticket replies for chat support
    fetchTicketReplies(ticket.id);
  };

  // Function to close escalated ticket detail view
  const closeEscalatedTicketView = () => {
    setSelectedEscalatedTicket(null);
    setEscalatedTicketView('ticket');
  };

  // Function to handle closed ticket view
  const handleClosedTicketView = (ticket) => {
    setSelectedClosedTicket(ticket);
    setClosedTicketView('ticket');
    // Fetch ticket replies for chat support
    fetchTicketReplies(ticket.id);
  };

  // Function to close closed ticket detail view
  const closeClosedTicketView = () => {
    setSelectedClosedTicket(null);
    setClosedTicketView('ticket');
  };

  // Reply functionality - Removed from dashboard, now only available in ticket detail view
  // Reply functionality has been moved to TicketDetailPage component


  // Chat helper functions
  const fetchTicketReplies = async (ticketId) => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch from both chat messages and replies tables
      const [chatResponse, repliesResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/chat/messages/${ticketId}`, {
          method: 'GET',
          headers: headers
        }),
        fetch(`http://localhost:5000/api/replies/${ticketId}`, {
          method: 'GET',
          headers: headers
        })
      ]);
      
      const chatData = await chatResponse.json();
      const repliesData = await repliesResponse.json();
      
      // Combine both data sources
      let allMessages = [];
      
      // Add chat messages (customer messages)
      if (chatData.success && Array.isArray(chatData.data)) {
        allMessages = [...chatData.data];
      }
      
      // Add replies (agent/manager messages)
      if (repliesData.success && Array.isArray(repliesData.data)) {
        const formattedReplies = repliesData.data.map(reply => ({
          id: reply.id,
          message: reply.message,
          content: reply.message,
          sender_type: reply.is_customer_reply ? 'customer' : 'agent',
          sender_name: reply.is_customer_reply ? reply.customer_name : reply.agent_name,
          created_at: reply.sent_at,
          timestamp: reply.sent_at
        }));
        allMessages = [...allMessages, ...formattedReplies];
      }
      
      // Sort by timestamp
      allMessages.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.timestamp || 0);
        return dateA - dateB; // Oldest first for chat display
      });
      
      setTicketReplies(prev => ({
        ...prev,
        [ticketId]: allMessages
      }));
    } catch (error) {
      console.error('❌ Error fetching ticket replies:', error);
    }
  };

  const hasCustomerReplies = (ticketId) => {
    const replies = ticketReplies[ticketId] || [];
    return replies.some(reply => reply.sender_type === 'customer');
  };

  const getCustomerReplyCount = (ticketId) => {
    const replies = ticketReplies[ticketId] || [];
    return replies.filter(reply => reply.sender_type === 'customer').length;
  };

  const getLatestCustomerReplyTime = (ticketId) => {
    const replies = ticketReplies[ticketId] || [];
    const customerReplies = replies.filter(reply => reply.sender_type === 'customer');
    if (customerReplies.length === 0) return null;
    
    const latestReply = customerReplies.reduce((latest, current) => 
      new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    );
    
    return new Date(latestReply.created_at);
  };

  const tabList = [
    { key: 'overview', label: '📊 Overview', count: 0 },
    { key: 'analytics', label: '📈 Analytics', count: 0 },
    { key: 'team', label: '👥 Team Performance', count: performanceMetrics.teamPerformance?.length || 0 },
    { key: 'escalated', label: '🚨 Escalated', count: getTicketsByStatus('escalated').length },
    { key: 'closed', label: '✅ Closed Tickets', count: getTicketsByStatus('closed').length },
    { key: 'reports', label: '📋 Reports', count: 0 }
  ];
  
  // Debug logging for tab counts
  console.log('📊 Tab counts:', {
    team: performanceMetrics.teamPerformance?.length || 0,
    escalated: getTicketsByStatus('escalated').length,
    closed: getTicketsByStatus('closed').length,
    totalTickets: tickets.length,
    totalTeamMembers: teamMembers.length
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading manager dashboard...</p>
      </div>
    );
  }

  return (
    <div className="manager-dashboard sidepanel-layout">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🔧 Support Manager Dashboard</h1>
          <div className="header-actions">
            <button 
              className="action-button refresh-btn" 
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('userData');
                localStorage.removeItem('userToken');
                localStorage.removeItem('access_token');
                navigate('/login', { replace: true });
              }}
              className="manager-logout-btn"
            >
              ↗ Logout
            </button>
          </div>
        </div>
      </header>

      <div className="sidepanel-main">
        <nav className="sidepanel-nav">
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`sidepanel-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && <span className="tab-badge">{tab.count}</span>}
            </button>
          ))}
        </nav>

        <main className="sidepanel-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">🎫</span>
                    <div className="metric-value">{performanceMetrics.totalTickets}</div>
                  </div>
                  <h3>Total Tickets</h3>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">✅</span>
                    <div className="metric-value">{performanceMetrics.resolvedTickets}</div>
                  </div>
                  <h3>Resolved</h3>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">📊</span>
                    <div className="metric-value">
                      {performanceMetrics.totalTickets > 0 
                        ? Math.round((performanceMetrics.resolvedTickets / performanceMetrics.totalTickets) * 100)
                        : 0}%
                    </div>
                  </div>
                  <h3>Resolution Rate</h3>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">⏱️</span>
                    <div className="metric-value">{performanceMetrics.avgResolutionTime}h</div>
                  </div>
                  <h3>Avg Resolution Time</h3>
                </div>
              </div>

              <div className="recent-tickets">
                <h3>Recent Tickets</h3>
                <div className="ticket-list">
                  {tickets.slice(0, 10).map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-info">
                        <span className="ticket-title">{ticket.issue_title}</span>
                        <span className="ticket-status">{ticket.status}</span>
                      </div>
                      <div className="ticket-meta">
                        <span>By: {ticket.name}</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="analytics-header">
                <h3> Analytics Dashboard</h3>
                <p>Comprehensive insights into team performance and ticket metrics</p>

              </div>
              
              <div className="analytics-grid">

                {/* Key Performance Indicators */}
                <div className="analytics-card kpi-section">
                  <h4>🎯 Key Performance Indicators</h4>
                  <div className="kpi-grid">
                    <div className="kpi-item">
                      <div className="kpi-icon">📈</div>
                      <div className="kpi-content">
                        <div className="kpi-value">{performanceMetrics.totalTickets || 'N/A'}</div>
                        <div className="kpi-label">Total Tickets</div>
                      </div>
                    </div>
                    <div className="kpi-item">
                      <div className="kpi-icon">✅</div>
                      <div className="kpi-content">
                        <div className="kpi-value">{performanceMetrics.resolvedTickets || 'N/A'}</div>
                        <div className="kpi-label">Resolved</div>
                      </div>
                    </div>
                    <div className="kpi-item">
                      <div className="kpi-icon">⏱️</div>
                      <div className="kpi-content">
                        <div className="kpi-value">{performanceMetrics.avgResolutionTime || 0}h</div>
                        <div className="kpi-label">Avg Resolution</div>
                      </div>
                    </div>
                    <div className="kpi-item">
                      <div className="kpi-icon">🚀</div>
                      <div className="kpi-content">
                        <div className="kpi-value">
                          {performanceMetrics.totalTickets > 0 
                            ? Math.round((performanceMetrics.resolvedTickets / performanceMetrics.totalTickets) * 100)
                            : 0}%
                        </div>
                        <div className="kpi-label">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="analytics-card status-distribution">
                  <h4>📊 Ticket Status Distribution</h4>
                  <div className="status-chart">
                    <div className="status-bar">
                      <div className="status-label">New</div>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar-fill new"
                          style={{ width: `${(getTicketsByStatus('new').length / performanceMetrics.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                      <div className="status-count">{getTicketsByStatus('new').length}</div>
                    </div>
                    <div className="status-bar">
                      <div className="status-label">In Progress</div>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar-fill in-progress"
                          style={{ width: `${(getTicketsByStatus('in_progress').length / performanceMetrics.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                      <div className="status-count">{getTicketsByStatus('in_progress').length}</div>
                    </div>
                    <div className="status-bar">
                      <div className="status-label">Escalated</div>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar-fill escalated"
                          style={{ width: `${(getTicketsByStatus('escalated').length / performanceMetrics.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                      <div className="status-count">{getTicketsByStatus('escalated').length}</div>
                    </div>
                    <div className="status-bar">
                      <div className="status-label">Closed</div>
                      <div className="status-bar-container">
                        <div 
                          className="status-bar-fill closed"
                          style={{ width: `${(getTicketsByStatus('closed').length / performanceMetrics.totalTickets) * 100}%` }}
                        ></div>
                      </div>
                      <div className="status-count">{getTicketsByStatus('closed').length}</div>
                    </div>
                  </div>
                </div>

                {/* Team Performance Chart */}
                <div className="analytics-card team-performance-chart">
                  <h4>👥 Team Performance Overview</h4>
                  <div className="team-chart">
                    {performanceMetrics.teamPerformance && performanceMetrics.teamPerformance.length > 0 ? (
                      performanceMetrics.teamPerformance.map(member => (
                        <div key={member.id} className="team-chart-item">
                          <div className="member-chart-info">
                            <div className="member-name">{member.name}</div>
                            <div className="member-role">{member.role}</div>
                          </div>
                          <div className="performance-bars">
                            <div className="performance-bar">
                              <div className="bar-label">Assigned</div>
                              <div className="bar-container">
                                <div 
                                  className="bar-fill assigned"
                                  style={{ width: `${Math.min((member.assignedTickets / Math.max(...performanceMetrics.teamPerformance.map(m => m.assignedTickets), 1)) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="bar-value">{member.assignedTickets}</div>
                            </div>
                            <div className="performance-bar">
                              <div className="bar-label">Resolved</div>
                              <div className="bar-container">
                                <div 
                                  className="bar-fill resolved"
                                  style={{ width: `${Math.min((member.resolvedTickets / Math.max(...performanceMetrics.teamPerformance.map(m => m.resolvedTickets), 1)) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="bar-value">{member.resolvedTickets}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-team-data">
                        <p>No team performance data available</p>
                        <p>Team Performance Array: {JSON.stringify(performanceMetrics.teamPerformance)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="analytics-card recent-activity">
                  <h4>🕒 Recent Activity</h4>
                  <div className="activity-list">
                    {tickets.slice(0, 8).map(ticket => (
                      <div key={ticket.id} className="activity-item">
                        <div className="activity-icon">
                          {ticket.status === 'new' && '🆕'}
                          {ticket.status === 'in_progress' && '⏳'}
                          {ticket.status === 'escalated' && '🚨'}
                          {ticket.status === 'closed' && '✅'}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">Ticket #{ticket.id}</div>
                          <div className="activity-details">
                            {ticket.issue_title || 'No Title'} • {ticket.name}
                          </div>
                          <div className="activity-time">{formatDate(ticket.created_at)}</div>
                        </div>
                        <div className="activity-status">
                          <span className={`status-badge ${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="team-section">
              <h3>Team Performance</h3>
              
              {/* Debug Information - Remove this after confirming fix */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                marginBottom: '20px', 
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                fontSize: '14px'
              }}>
                <strong> ℹ️ Info:</strong><br/>
                <i></i>Total team members: {teamMembers.length}<br/>
                Support executives/Agents found: {performanceMetrics.teamPerformance?.length || 0}
              </div>
              
              {performanceMetrics.teamPerformance && performanceMetrics.teamPerformance.length > 0 ? (
                <div className="team-grid">
                  {performanceMetrics.teamPerformance.map(member => (
                    <div key={member.id} className="team-member-card">
                      <div className="member-info">
                        <h4>{member.name}</h4>
                        <p>{member.email}</p>
                      </div>
                      <div className="member-stats">
                        <div className="stat">
                          <span className="stat-label">Assigned</span>
                          <span className="stat-value" style={{ color: '#007bff', fontWeight: 'bold' }}>{member.assignedTickets}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Resolved</span>
                          <span className="stat-value" style={{ color: '#28a745', fontWeight: 'bold' }}>{member.resolvedTickets}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Success Rate</span>
                          <span className="stat-value" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                            {member.assignedTickets > 0 
                              ? Math.round((member.resolvedTickets / member.assignedTickets) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4>No Team Performance Data Available</h4>
                  <p>No support executives found in the team data.</p>
                  <p>Total team members: {teamMembers.length}</p>
                  <p>Team performance array: {performanceMetrics.teamPerformance?.length || 0} members</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'escalated' && (
            <div className="escalated-tickets-section">
              {!selectedEscalatedTicket ? (
                // Ticket List View
                <>
                  <div className="escalated-header">
                    <span className="escalated-count">
                      {getTicketsByStatus('escalated').length} escalated tickets found
                    </span>
                  </div>
                  
                  {getTicketsByStatus('escalated').length === 0 ? (
                    <div className="no-escalated-tickets">
                      <p>No escalated tickets found</p>
                    </div>
                  ) : (
                    <div className="escalated-table-container">
                      <table className="escalated-tickets-table">
                        <thead>
                          <tr className="escalated-table-header">
                            <th 
                              className="escalated-header-cell sortable-header" 
                              onClick={() => handleSort('id')}
                              style={{ cursor: 'pointer' }}
                            >
                              TICKET NO
                              {sortField === 'id' && (
                                <span className="sort-arrow">
                                  {sortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th 
                              className="escalated-header-cell sortable-header" 
                              onClick={() => handleSort('issue_title')}
                              style={{ cursor: 'pointer' }}
                            >
                              ISSUE NAME
                              {sortField === 'issue_title' && (
                                <span className="sort-arrow">
                                  {sortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th 
                              className="escalated-header-cell sortable-header" 
                              onClick={() => handleSort('product_id')}
                              style={{ cursor: 'pointer' }}
                            >
                              PRODUCT
                              {sortField === 'product_id' && (
                                <span className="sort-arrow">
                                  {sortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th className="escalated-header-cell">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortTickets(getTicketsByStatus('escalated'), sortField, sortDirection).map((ticket, index) => (
                            <tr key={ticket.id} className="escalated-table-row">
                              <td className="escalated-table-cell escalated-ticket-no">#{ticket.id}</td>
                              <td className="escalated-table-cell escalated-issue-name">{ticket.issue_title || 'No Title'}</td>
                              <td className="escalated-table-cell escalated-product">
                                <span className="escalated-product-badge">
                                  {getProductName(ticket.product_id) || ticket.product || 'Unknown'}
                                </span>
                              </td>
                              <td className="escalated-table-cell escalated-actions">
                                <button 
                                  onClick={() => handleEscalatedTicketView(ticket)}
                                  title="View Ticket Details"
                                  className="escalated-view-btn"
                                >
                                  View Ticket
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                // Ticket Detail View
                <div className="escalated-ticket-detail">
                  {/* Header with back button and toggle */}
                  <div className="escalated-detail-header">
                    <div className="escalated-detail-header-left">
                      <button 
                        onClick={closeEscalatedTicketView}
                        className="escalated-back-btn"
                      >
                        ← Back to List
                      </button>
                      <h3 className="escalated-detail-title">
                        Escalated Ticket #{selectedEscalatedTicket.id}
                      </h3>
                    </div>
                    <div className="escalated-detail-tabs">
                      <button 
                        onClick={() => setEscalatedTicketView('ticket')}
                        className={`escalated-tab-btn ${escalatedTicketView === 'ticket' ? 'active' : ''}`}
                      >
                        📋 Ticket Information
                      </button>
                      <button 
                        onClick={() => setEscalatedTicketView('chat')}
                        className={`escalated-tab-btn ${escalatedTicketView === 'chat' ? 'active' : ''}`}
                      >
                        💬 Chat Support
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="escalated-detail-content">
                    {escalatedTicketView === 'ticket' ? (
                      // Ticket Information View
                      <div className="escalated-ticket-info">
                        <div className="escalated-info-grid">
                          <div className="escalated-info-card">
                            <h4 className="escalated-info-card-title">Basic Information</h4>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Ticket ID:</span>
                              <span className="escalated-info-value">#{selectedEscalatedTicket.id}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Customer Name:</span>
                              <span className="escalated-info-value">{selectedEscalatedTicket.name || 'N/A'}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Email:</span>
                              <span className="escalated-info-value">{selectedEscalatedTicket.email || 'N/A'}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Phone:</span>
                              <span className="escalated-info-value">{selectedEscalatedTicket.phone || 'N/A'}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Status:</span>
                              <span className="escalated-info-value escalated-status-badge">{selectedEscalatedTicket.status}</span>
                            </div>
                          </div>

                          <div className="escalated-info-card">
                            <h4 className="escalated-info-card-title">Issue Details</h4>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Issue Title:</span>
                              <span className="escalated-info-value">{selectedEscalatedTicket.issue_title || 'No Title'}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Product:</span>
                              <span className="escalated-info-value">{getProductName(selectedEscalatedTicket.product_id) || selectedEscalatedTicket.product || 'Unknown'}</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Priority:</span>
                              <span className="escalated-info-value escalated-priority-badge">High</span>
                            </div>
                            <div className="escalated-info-row">
                              <span className="escalated-info-label">Created:</span>
                              <span className="escalated-info-value">{formatDate(selectedEscalatedTicket.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="escalated-info-card escalated-description-card">
                          <h4 className="escalated-info-card-title">Issue Description</h4>
                          <div className="escalated-description-content">
                            {selectedEscalatedTicket.issue_description || selectedEscalatedTicket.description || 'No description available'}
                          </div>
                        </div>

                        <div className="escalated-info-card">
                          <h4 className="escalated-info-card-title">Additional Information</h4>
                          <div className="escalated-info-row">
                            <span className="escalated-info-label">Assigned To:</span>
                            <span className="escalated-info-value">{selectedEscalatedTicket.assigned_to || 'Unassigned'}</span>
                          </div>
                          <div className="escalated-info-row">
                            <span className="escalated-info-label">Department:</span>
                            <span className="escalated-info-value">{selectedEscalatedTicket.department || 'N/A'}</span>
                          </div>
                          <div className="escalated-info-row">
                            <span className="escalated-info-label">Module:</span>
                            <span className="escalated-info-value">{selectedEscalatedTicket.module || 'N/A'}</span>
                          </div>
                          <div className="escalated-info-row">
                            <span className="escalated-info-label">Last Updated:</span>
                            <span className="escalated-info-value">{formatDate(selectedEscalatedTicket.updated_at || selectedEscalatedTicket.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Chat Support View
                      <div className="escalated-chat-support">
                        <div className="escalated-chat-header">
                          <h4 className="escalated-chat-title">Chat Support Messages</h4>
                          <div className="escalated-chat-info">
                            <span className="escalated-chat-count">
                              {ticketReplies[selectedEscalatedTicket.id]?.length || 0} messages
                            </span>
                          </div>
                        </div>
                        
                        <div className="escalated-chat-container">
                          {ticketReplies[selectedEscalatedTicket.id] && ticketReplies[selectedEscalatedTicket.id].length > 0 ? (
                            <div className="escalated-chat-messages">
                              {ticketReplies[selectedEscalatedTicket.id].map((reply, index) => (
                                <div key={index} className={`escalated-chat-message ${reply.sender_type === 'customer' ? 'customer' : 'agent'}`}>
                                  <div className="escalated-message-header">
                                    <span className="escalated-message-sender">
                                      {reply.sender_type === 'customer' ? '👤 Customer' : '🎧 Support Agent'}
                                    </span>
                                    <span className="escalated-message-time">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <div className="escalated-message-content">
                                    {reply.message || reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="escalated-no-messages">
                              <p>No chat messages available for this ticket</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Reply Section */}
                        <div className="escalated-quick-reply">
                          <button 
                            onClick={() => toggleReplyForm(selectedEscalatedTicket)}
                            className="escalated-reply-btn"
                          >
                            💬 Send Quick Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'closed' && (
            <div className="closed-tickets-section">
              {!selectedClosedTicket ? (
                // Ticket List View
                <>
                  <div className="closed-header">
                    <span className="closed-count">
                      {getTicketsByStatus('closed').length} closed tickets found
                    </span>
                  </div>
                  
                  {getTicketsByStatus('closed').length === 0 ? (
                    <div className="no-closed-tickets">
                      <p>No closed tickets found</p>
                    </div>
                  ) : (
                    <div className="closed-table-container">
                      <table className="closed-tickets-table">
                        <thead>
                          <tr className="closed-table-header">
                            <th 
                              className="closed-header-cell sortable-header" 
                              onClick={() => handleClosedSort('id')}
                              style={{ cursor: 'pointer' }}
                            >
                              TICKET NO
                              {closedSortField === 'id' && (
                                <span className="sort-arrow">
                                  {closedSortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th 
                              className="closed-header-cell sortable-header" 
                              onClick={() => handleClosedSort('issue_title')}
                              style={{ cursor: 'pointer' }}
                            >
                              ISSUE NAME
                              {closedSortField === 'issue_title' && (
                                <span className="sort-arrow">
                                  {closedSortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th 
                              className="closed-header-cell sortable-header" 
                              onClick={() => handleClosedSort('product_id')}
                              style={{ cursor: 'pointer' }}
                            >
                              PRODUCT
                              {closedSortField === 'product_id' && (
                                <span className="sort-arrow">
                                  {closedSortDirection === 'asc' ? '⬆️' : '⬇️'}
                                </span>
                              )}
                            </th>
                            <th className="closed-header-cell">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortClosedTickets(getTicketsByStatus('closed'), closedSortField, closedSortDirection).map(ticket => (
                            <tr key={ticket.id} className="closed-table-row">
                              <td className="closed-table-cell closed-ticket-no">#{ticket.id}</td>
                              <td className="closed-table-cell closed-issue-name">{ticket.issue_title || 'No Title'}</td>
                              <td className="closed-table-cell closed-product">
                                <span className="closed-product-badge">
                                  {getProductName(ticket.product_id) || ticket.product || 'Unknown'}
                                </span>
                              </td>
                              <td className="closed-table-cell closed-actions">
                                <button 
                                  onClick={() => handleClosedTicketView(ticket)}
                                  title="View Ticket Details"
                                  className="closed-view-btn"
                                >
                                  View Ticket
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                // Ticket Detail View
                <div className="closed-ticket-detail">
                  {/* Header with back button and toggle */}
                  <div className="closed-detail-header">
                    <div className="closed-detail-header-left">
                      <button 
                        onClick={closeClosedTicketView}
                        className="closed-back-btn"
                      >
                        ← Back to List
                      </button>
                      <h3 className="closed-detail-title">
                        Closed Ticket #{selectedClosedTicket.id}
                      </h3>
                    </div>
                    <div className="closed-detail-tabs">
                      <button 
                        onClick={() => setClosedTicketView('ticket')}
                        className={`closed-tab-btn ${closedTicketView === 'ticket' ? 'active' : ''}`}
                      >
                        📋 Ticket Information
                      </button>
                      <button 
                        onClick={() => setClosedTicketView('chat')}
                        className={`closed-tab-btn ${closedTicketView === 'chat' ? 'active' : ''}`}
                      >
                        💬 Chat Support
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="closed-detail-content">
                    {closedTicketView === 'ticket' ? (
                      // Ticket Information View
                      <div className="closed-ticket-info">
                        <div className="closed-info-grid">
                          <div className="closed-info-card">
                            <h4 className="closed-info-card-title">Basic Information</h4>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Ticket ID:</span>
                              <span className="closed-info-value">#{selectedClosedTicket.id}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Customer Name:</span>
                              <span className="closed-info-value">{selectedClosedTicket.name || 'N/A'}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Email:</span>
                              <span className="closed-info-value">{selectedClosedTicket.email || 'N/A'}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Phone:</span>
                              <span className="closed-info-value">{selectedClosedTicket.phone || 'N/A'}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Status:</span>
                              <span className="closed-info-value closed-status-badge">{selectedClosedTicket.status}</span>
                            </div>
                          </div>

                          <div className="closed-info-card">
                            <h4 className="closed-info-card-title">Issue Details</h4>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Issue Title:</span>
                              <span className="closed-info-value">{selectedClosedTicket.issue_title || 'No Title'}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Product:</span>
                              <span className="closed-info-value">{getProductName(selectedClosedTicket.product_id) || selectedClosedTicket.product || 'Unknown'}</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Priority:</span>
                              <span className="closed-info-value closed-priority-badge">Resolved</span>
                            </div>
                            <div className="closed-info-row">
                              <span className="closed-info-label">Created:</span>
                              <span className="closed-info-value">{formatDate(selectedClosedTicket.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="closed-info-card closed-description-card">
                          <h4 className="closed-info-card-title">Issue Description</h4>
                          <div className="closed-description-content">
                            {selectedClosedTicket.issue_description || selectedClosedTicket.description || 'No description available'}
                          </div>
                        </div>

                        <div className="closed-info-card">
                          <h4 className="closed-info-card-title">Resolution Information</h4>
                          <div className="closed-info-row">
                            <span className="closed-info-label">Resolved By:</span>
                            <span className="closed-info-value">{selectedClosedTicket.assigned_to || 'System'}</span>
                          </div>
                          <div className="closed-info-row">
                            <span className="closed-info-label">Department:</span>
                            <span className="closed-info-value">{selectedClosedTicket.department || 'N/A'}</span>
                          </div>
                          <div className="closed-info-row">
                            <span className="closed-info-label">Module:</span>
                            <span className="closed-info-value">{selectedClosedTicket.module || 'N/A'}</span>
                          </div>
                          <div className="closed-info-row">
                            <span className="closed-info-label">Closed Date:</span>
                            <span className="closed-info-value">{formatDate(selectedClosedTicket.updated_at || selectedClosedTicket.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Chat Support View
                      <div className="closed-chat-support">
                        <div className="closed-chat-header">
                          <h4 className="closed-chat-title">Chat Support History</h4>
                          <div className="closed-chat-info">
                            <span className="closed-chat-count">
                              {ticketReplies[selectedClosedTicket.id]?.length || 0} messages
                            </span>
                          </div>
                        </div>
                        
                        <div className="closed-chat-container">
                          {ticketReplies[selectedClosedTicket.id] && ticketReplies[selectedClosedTicket.id].length > 0 ? (
                            <div className="closed-chat-messages">
                              {ticketReplies[selectedClosedTicket.id].map((reply, index) => (
                                <div key={index} className={`closed-chat-message ${reply.sender_type === 'customer' ? 'customer' : 'agent'}`}>
                                  <div className="closed-message-header">
                                    <span className="closed-message-sender">
                                      {reply.sender_type === 'customer' ? '👤 Customer' : '🎧 Support Agent'}
                                    </span>
                                    <span className="closed-message-time">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <div className="closed-message-content">
                                    {reply.message || reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="closed-no-messages">
                              <p>No chat messages available for this ticket</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Resolution Notice */}
                        <div className="closed-resolution-notice">
                          <p>✅ This ticket has been resolved and closed. Chat support is now read-only.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <h3>Performance Reports</h3>
              
              {/* Monthly Summary Stats Cards */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">📊</span>
                    <span className="metric-value">{performanceMetrics.totalTickets}</span>
                  </div>
                  <h3>Total Tickets</h3>
                </div>
                
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">✅</span>
                    <span className="metric-value">{performanceMetrics.resolvedTickets}</span>
                  </div>
                  <h3>Resolved Tickets</h3>
                </div>
                
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">⏳</span>
                    <span className="metric-value">{performanceMetrics.totalTickets - performanceMetrics.resolvedTickets}</span>
                  </div>
                  <h3>Pending Tickets</h3>
                </div>
                
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-emoji">⏱️</span>
                    <span className="metric-value">{performanceMetrics.avgResolutionTime}h</span>
                  </div>
                  <h3>Avg Resolution Time</h3>
                </div>
              </div>
              
              {/* Team Performance Report Card */}
              <div className="report-cards" style={{ marginTop: '32px' }}>
                <div className="report-card">
                  <h4>Team Performance</h4>
                  <div className="report-content">
                    {performanceMetrics.teamPerformance.map(member => (
                      <div key={member.id} className="member-report">
                        <strong>{member.name}</strong>
                        <span>Assigned: {member.assignedTickets}</span>
                        <span>Resolved: {member.resolvedTickets}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reply Form Modal */}
      {showReplyForm && selectedTicketForReply && (
        <div className="reply-modal-overlay">
          <div className="reply-modal">
            <div className="reply-modal-header">
              <h3>💬 Quick Reply to Ticket #{selectedTicketForReply.id}</h3>
              <button 
                className="close-reply-btn"
                onClick={() => toggleReplyForm()}
              >
                ✕
              </button>
            </div>
            
            <div className="reply-modal-content">
              <div className="ticket-info">
                <p><strong>Customer:</strong> {selectedTicketForReply.name}</p>
                <p><strong>Issue:</strong> {selectedTicketForReply.issue_title || 'No Title'}</p>
              </div>
              
              <div className="reply-form">
                <label htmlFor="reply-textarea">Your Reply:</label>
                <textarea
                  id="reply-textarea"
                  className="reply-textarea"
                  placeholder="Type your reply message here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                />
                
                <div className="reply-actions">
                  <button
                    className={`reply-send-btn ${buttonToggle ? 'reply-send-btn-toggled' : ''}`}
                    onClick={handleReplySubmit}
                    disabled={sendingReply || !replyText.trim()}
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                  <button
                    className={`reply-cancel-btn ${buttonToggle ? 'reply-cancel-btn-toggled' : ''}`}
                    onClick={handleCancelClick}
                    disabled={sendingReply}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard; 
