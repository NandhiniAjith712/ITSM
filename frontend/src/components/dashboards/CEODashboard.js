import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CEODashboard.css';

const CEODashboard = ({ ceo }) => {
  const navigate = useNavigate();
  
  // SECURITY CHECK: Ensure only CEOs can access this dashboard
  useEffect(() => {
    console.log('🔒 CEODashboard: Checking user role...');
    console.log('👤 CEO prop:', ceo);
    
    // Check if user is actually a CEO
    if (!ceo || ceo.role !== 'ceo') {
      console.log(' Access denied - User is not a CEO:', ceo?.role);
      console.log('🔄 Redirecting to login...');
      navigate('/login', { replace: true });
      return;
    }
    
    console.log('✅ CEODashboard: Access granted for CEO:', ceo.name);
  }, [ceo, navigate]);
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  const [executiveMetrics, setExecutiveMetrics] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: 0,
    customerSatisfaction: 0,
    departmentPerformance: [],
    monthlyTrends: [],
    agentPerformance: []
  });

  // Sorting state for Agent Performance table
  const [agentSortField, setAgentSortField] = useState(null);
  const [agentSortDirection, setAgentSortDirection] = useState('asc');

  // Sorting state for Assignments table
  const [assignmentsSortField, setAssignmentsSortField] = useState(null);
  const [assignmentsSortDirection, setAssignmentsSortDirection] = useState('asc');

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Sorting function for Agent Performance table
  const sortAgents = (agents, field, direction) => {
    if (!field) return agents;
    
    return [...agents].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
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

  // Sorting function for Assignments table
  const sortAssignments = (assignments, field, direction) => {
    if (!field) return assignments;
    
    return [...assignments].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle date sorting
      if (field === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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

  // Handle sort click for Agent Performance table
  const handleAgentSort = (field) => {
    if (agentSortField === field) {
      // Same field clicked - toggle direction
      setAgentSortDirection(agentSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setAgentSortField(field);
      setAgentSortDirection('asc');
    }
  };

  // Handle sort click for Assignments table
  const handleAssignmentsSort = (field) => {
    if (assignmentsSortField === field) {
      // Same field clicked - toggle direction
      setAssignmentsSortDirection(assignmentsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setAssignmentsSortField(field);
      setAssignmentsSortDirection('asc');
    }
  };

  // Fetch executive data with authentication and error handling
  const fetchExecutiveData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setIsRefreshing(true);
      setError('');
      
      const headers = getAuthHeaders();
      
      // Fetch tickets, departments, agents, and assignments in parallel
      const [ticketsResponse, departmentsResponse, agentsResponse, assignmentsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/tickets', { headers }),
        fetch('http://localhost:5000/api/agents?role=support_manager', { headers }),
        fetch('http://localhost:5000/api/agents?role=support_executive', { headers }),
        fetch('http://localhost:5000/api/assignments', { headers })
      ]);

      let ticketsData = [];
      let departmentsList = [];
      let agentsList = [];
      let assignmentsData = [];

      // Handle tickets response
      if (ticketsResponse.ok) {
        const result = await ticketsResponse.json();
        ticketsData = result.success ? (result.data || []) : [];
        setTickets(ticketsData);
      } else {
        throw new Error(`Failed to fetch tickets: ${ticketsResponse.status}`);
      }

      // Handle departments response
      if (departmentsResponse.ok) {
        const departmentsData = await departmentsResponse.json();
        departmentsList = departmentsData.success ? (departmentsData.data || []) : [];
        setDepartments(departmentsList);
      } else {
        console.warn('Failed to fetch departments:', departmentsResponse.status);
      }

      // Handle agents response (now from single agents table)
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        agentsList = agentsData.success ? (agentsData.data || []).filter(agent => 
          agent.is_active
        ) : [];
        setAgents(agentsList);
      } else {
        console.warn('Failed to fetch agents:', agentsResponse.status);
      }

      // Handle assignments response
      if (assignmentsResponse.ok) {
        const assignmentsResult = await assignmentsResponse.json();
        assignmentsData = assignmentsResult.success ? (assignmentsResult.data || []) : [];
      } else {
        console.warn('Failed to fetch assignments:', assignmentsResponse.status);
      }
      
      console.log(`📊 CEO Dashboard: Found ${agentsList.length} agents and ${assignmentsData.length} assignments`);
      console.log('🔍 First agent data:', agentsList[0]);

      // Calculate executive metrics
      calculateExecutiveMetrics(ticketsData, departmentsList, agentsList);
      setLastUpdated(new Date());
      
      // For refresh operations, keep the refreshing state for 2 seconds
      if (isRefresh) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error('Error fetching executive data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateExecutiveMetrics = (ticketsData, departmentsList, agentsList = []) => {
    const totalTickets = ticketsData.length;
    const resolvedTickets = ticketsData.filter(t => t.status === 'closed').length;
    const avgResolutionTime = totalTickets > 0 ? 
      ticketsData.reduce((acc, ticket) => {
        if (ticket.resolution_time) acc += ticket.resolution_time;
        return acc;
      }, 0) / totalTickets : 0;

    // Calculate customer satisfaction (assuming satisfaction_rating field)
    const ratedTickets = ticketsData.filter(t => t.satisfaction_rating);
    const avgSatisfaction = ratedTickets.length > 0 ? 
      ratedTickets.reduce((acc, ticket) => acc + ticket.satisfaction_rating, 0) / ratedTickets.length : 0;

    // Department performance
    const departmentPerformance = departmentsList.map(dept => ({
      ...dept,
      totalTickets: ticketsData.filter(t => t.department === dept.department).length,
      resolvedTickets: ticketsData.filter(t => t.department === dept.department && t.status === 'closed').length,
      avgResolutionTime: calculateDeptAvgTime(ticketsData.filter(t => t.department === dept.department))
    }));

    // Agent performance (now simplified since all agents are in one table)
    const agentPerformance = agentsList.map(agent => {
      const agentTickets = ticketsData.filter(t => t.assigned_to === agent.id);
      const agentResolved = agentTickets.filter(t => t.status === 'closed');
      const agentAvgTime = calculateDeptAvgTime(agentTickets);
      
      return {
        ...agent,
        totalTickets: agentTickets.length,
        resolvedTickets: agentResolved.length,
        avgResolutionTime: agentAvgTime,
        resolutionRate: agentTickets.length > 0 ? Math.round((agentResolved.length / agentTickets.length) * 100) : 0
      };
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = calculateMonthlyTrends(ticketsData);

    setExecutiveMetrics({
      totalTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime),
      customerSatisfaction: Math.round(avgSatisfaction * 10) / 10, // Round to 1 decimal
      departmentPerformance,
      monthlyTrends,
      agentPerformance
    });
  };

  const calculateDeptAvgTime = (deptTickets) => {
    if (deptTickets.length === 0) return 0;
    const totalTime = deptTickets.reduce((acc, ticket) => {
      if (ticket.resolution_time) acc += ticket.resolution_time;
      return acc;
    }, 0);
    return Math.round(totalTime / deptTickets.length);
  };

  const calculateMonthlyTrends = (ticketsData) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthTickets = ticketsData.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate.getMonth() === date.getMonth() && 
               ticketDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthName,
        tickets: monthTickets.length,
        resolved: monthTickets.filter(t => t.status === 'closed').length
      });
    }
    
    return months;
  };

  // Setup real-time updates
  useEffect(() => {
    // Initial fetch
    fetchExecutiveData();
    
    // Setup auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchExecutiveData(true); // Pass true to indicate this is a refresh
    }, 30000);
    
    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Handle logout functionality
  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('tickUser');
    localStorage.removeItem('token');
    localStorage.removeItem('autoLoginContext');
    
    // Clear any agent data that might be stored
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_logged_in');
    
    // Clear session persistence data
    localStorage.removeItem('session_expires');
    localStorage.removeItem('login_timestamp');
    
    // Clear remembered credentials
    localStorage.removeItem('remembered_login_id');
    localStorage.removeItem('remembered_password');
    
    // Navigate to login page
    navigate('/login');
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTicketsByStatus = (status) => tickets.filter(ticket => ticket.status === status);

  const navigationItems = [
    { key: 'executive', label: 'Executive Dashboard', icon: '👑' },
    { key: 'departments', label: 'Department Performance', icon: '🏢', count: departments.length },
    { key: 'agents', label: 'Agent Performance', icon: '👥', count: agents.length },
    { key: 'assignments', label: 'Active Assignments', icon: '📋', count: tickets.filter(t => t.assigned_to).length },
    { key: 'trends', label: 'Trends & Analytics', icon: '📊' },
    { key: 'strategic', label: 'Strategic Insights', icon: '💡' }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading executive dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ceo-dashboard sidepanel-layout">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>CEO Executive Dashboard</h1>
          <div className="header-info">
            {error && <div className="error-message">⚠️ {error}</div>}
            
          </div>
          <div className="header-actions">
            <button 
              className="action-button refresh-btn" 
              onClick={() => fetchExecutiveData(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button 
              className="logout-btn-new"
              onClick={handleLogout}
            >
              <span className="btn-icon">↗</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="sidepanel-main">
        <nav className="sidepanel-nav">
          {navigationItems.map(item => (
            <div key={item.key} className="nav-section">
              <button
                className={`nav-sub-item${activeTab === item.key ? ' active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="nav-sub-icon">{item.icon}</span>
                <span className="nav-sub-label">{item.label}</span>
                {item.count > 0 && (
                  <span className="nav-sub-arrow">{item.count}</span>
                )}
              </button>
            </div>
          ))}
        </nav>

        <main className="sidepanel-content">
          {activeTab === 'executive' && (
            <div className="executive-section">
              <div className="executive-metrics">
                <div className="metric-card primary">
                  <h3>Total Support Tickets</h3>
                  <div className="metric-value">📊 {executiveMetrics.totalTickets}</div>
                  <div className="metric-trend">+12% from last month</div>
                </div>
                <div className="metric-card success">
                  <h3>Resolved Tickets</h3>
                  <div className="metric-value">✅ {executiveMetrics.resolvedTickets}</div>
                  <div className="metric-trend">
                    {executiveMetrics.totalTickets > 0 
                      ? Math.round((executiveMetrics.resolvedTickets / executiveMetrics.totalTickets) * 100)
                      : 0}% resolution rate
                  </div>
                </div>
                <div className="metric-card info">
                  <h3>Avg Resolution Time</h3>
                  <div className="metric-value">⏱️ {executiveMetrics.avgResolutionTime}h</div>
                  <div className="metric-trend">Target: 24h</div>
                </div>
                <div className="metric-card satisfaction">
                  <h3>Customer Satisfaction</h3>
                  <div className="metric-value">😊 {executiveMetrics.customerSatisfaction}/5</div>
                  <div className="metric-trend">Target: 4.5/5</div>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-value">⚡ {getTicketsByStatus('in_progress').length}</div>
                  <h4>Active Tickets</h4>
                </div>
                <div className="stat-card">
                  <div className="stat-value">🚨 {getTicketsByStatus('escalated').length}</div>
                  <h4>Escalated Issues</h4>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    🆕 {tickets.filter(t => {
                      const ticketDate = new Date(t.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return ticketDate >= weekAgo;
                    }).length}
                  </div>
                  <h4>New This Week</h4>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="departments-section">
              <h3>Department Performance Overview</h3>
              <div className="department-grid">
                {executiveMetrics.departmentPerformance.map(dept => (
                  <div key={dept.id} className="department-card">
                    <div className="department-header">
                      <h4>{dept.department}</h4>
                      <span className="manager-name">Manager: {dept.name}</span>
                    </div>
                    <div className="department-metrics">
                      <div className="dept-metric">
                        <span className="metric-label total-tickets">Total Tickets</span>
                        <span className="metric-value">{dept.totalTickets}</span>
                      </div>
                      <div className="dept-metric">
                        <span className="metric-label resolved">Resolved</span>
                        <span className="metric-value">{dept.resolvedTickets}</span>
                      </div>
                      <div className="dept-metric">
                        <span className="metric-label success-rate">Success Rate</span>
                        <span className="metric-value">
                          {dept.totalTickets > 0 
                            ? Math.round((dept.resolvedTickets / dept.totalTickets) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="dept-metric">
                        <span className="metric-label avg-time">Avg Time</span>
                        <span className="metric-value">{dept.avgResolutionTime}h</span>
                      </div>
                    </div>
                    <div className="department-status">
                      {dept.totalTickets > 0 && (dept.resolvedTickets / dept.totalTickets) >= 0.8 ? (
                        <span className="status-badge excellent">Excellent</span>
                      ) : dept.totalTickets > 0 && (dept.resolvedTickets / dept.totalTickets) >= 0.6 ? (
                        <span className="status-badge good">Good</span>
                      ) : (
                        <span className="status-badge needs-improvement">Needs Improvement</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <>
              <h3 className="agents-page-heading">Agent Performance Overview</h3>
              <div className="agents-section">
                <div className="agent-table-container">
                <table className="agent-table">
                  <thead>
                    <tr>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('name')}
                        style={{ cursor: 'pointer' }}
                      >
                        Agent Name
                        {agentSortField === 'name' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('role')}
                        style={{ cursor: 'pointer' }}
                      >
                        Role
                        {agentSortField === 'role' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('totalTickets')}
                        style={{ cursor: 'pointer' }}
                      >
                        Total Tickets
                        {agentSortField === 'totalTickets' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('resolvedTickets')}
                        style={{ cursor: 'pointer' }}
                      >
                        Resolved
                        {agentSortField === 'resolvedTickets' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('resolutionRate')}
                        style={{ cursor: 'pointer' }}
                      >
                        Success Rate
                        {agentSortField === 'resolutionRate' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('avgResolutionTime')}
                        style={{ cursor: 'pointer' }}
                      >
                        Avg Time
                        {agentSortField === 'avgResolutionTime' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAgentSort('status')}
                        style={{ cursor: 'pointer' }}
                      >
                        Status
                        {agentSortField === 'status' && (
                          <span className="sort-arrow">
                            {agentSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortAgents(executiveMetrics.agentPerformance, agentSortField, agentSortDirection).map(agent => (
                      <tr key={agent.id}>
                        <td className="agent-name">{agent.name}</td>
                        <td>
                          <span className="role-badge">{agent.role || 'Unknown'}</span>
                        </td>
                        <td className="metric-cell total-tickets">{agent.totalTickets}</td>
                        <td className="metric-cell resolved">{agent.resolvedTickets}</td>
                        <td className="metric-cell success-rate">{agent.resolutionRate}%</td>
                        <td className="metric-cell avg-time">{agent.avgResolutionTime}h</td>
                        <td>
                          {agent.resolutionRate >= 90 ? (
                            <span className="status-badge excellent">⭐ Excellent</span>
                          ) : agent.resolutionRate >= 75 ? (
                            <span className="status-badge good">👍 Good</span>
                          ) : agent.resolutionRate >= 60 ? (
                            <span className="status-badge average">📈 Average</span>
                          ) : (
                            <span className="status-badge needs-improvement">📚 Needs Training</span>
                          )}
                        </td>
                        <td className="agent-contact">
                          {agent.email && (
                            <small>📧 {agent.email}</small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {executiveMetrics.agentPerformance.length === 0 && (
                  <div className="no-data">
                    <p>👥 No agent performance data available</p>
                    <p>Agents will appear here once they start handling tickets</p>
                  </div>
                )}
              </div>
              </div>
            </>
          )}

          {activeTab === 'assignments' && (
            <div className="assignments-section">
              <h3>Total Active Assignments: {tickets.filter(t => t.assigned_to && t.status !== 'closed').length}</h3>
              <div className="assignments-table">
                <table>
                  <thead>
                    <tr>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAssignmentsSort('id')}
                        style={{ cursor: 'pointer' }}
                      >
                        Ticket ID
                        {assignmentsSortField === 'id' && (
                          <span className="sort-arrow">
                            {assignmentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAssignmentsSort('issue_title')}
                        style={{ cursor: 'pointer' }}
                      >
                        Issue Title
                        {assignmentsSortField === 'issue_title' && (
                          <span className="sort-arrow">
                            {assignmentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAssignmentsSort('assigned_to')}
                        style={{ cursor: 'pointer' }}
                      >
                        Assigned Agent
                        {assignmentsSortField === 'assigned_to' && (
                          <span className="sort-arrow">
                            {assignmentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAssignmentsSort('status')}
                        style={{ cursor: 'pointer' }}
                      >
                        Status
                        {assignmentsSortField === 'status' && (
                          <span className="sort-arrow">
                            {assignmentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                      <th 
                        className="sortable-header" 
                        onClick={() => handleAssignmentsSort('created_at')}
                        style={{ cursor: 'pointer' }}
                      >
                        Created
                        {assignmentsSortField === 'created_at' && (
                          <span className="sort-arrow">
                            {assignmentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                          </span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortAssignments(
                      tickets
                        .filter(ticket => ticket.assigned_to && ticket.status !== 'closed'),
                      assignmentsSortField, 
                      assignmentsSortDirection
                    )
                      .map(ticket => {
                        const assignedAgent = agents.find(agent => agent.id === ticket.assigned_to);
                        return (
                          <tr key={ticket.id}>
                            <td>#{ticket.id}</td>
                            <td>{ticket.issue_title || ticket.description?.substring(0, 50) + '...'}</td>
                            <td>
                              {assignedAgent ? (
                                <div className="agent-info">
                                  <strong>{assignedAgent.name}</strong>
                                  <br />
                                  <small>{assignedAgent.email}</small>
                                </div>
                              ) : (
                                <span className="unknown-agent">Agent ID: {ticket.assigned_to}</span>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${ticket.status}`}>
                                {ticket.status === 'new' && '🆕 New'}
                                {ticket.status === 'in_progress' && '⏳ In Progress'}
                                {ticket.status === 'escalated' && '🆘 Escalated'}
                              </span>
                            </td>
                            <td>{formatDate(ticket.created_at)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {tickets.filter(t => t.assigned_to && t.status !== 'closed').length === 0 && (
                  <div className="no-assignments">
                    <p>📭 No active assignments found</p>
                    <p>All tickets are either unassigned or completed</p>
                  </div>
                )}
                
                {tickets.filter(t => t.assigned_to && t.status !== 'closed').length > 0 && (
                  <div className="table-footer">
                    <p>Total Active Assignments: {tickets.filter(t => t.assigned_to && t.status !== 'closed').length}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="trends-section">
              <h3>Monthly Trends & Analytics</h3>
              <div className="trends-grid">
                <div className="trend-chart">
                  <h4>Ticket Volume Trends</h4>
                  <div className="chart-container">
                    {executiveMetrics.monthlyTrends.map((month, index) => {
                      const maxTickets = Math.max(...executiveMetrics.monthlyTrends.map(m => m.tickets), 1);
                      const minTickets = Math.min(...executiveMetrics.monthlyTrends.map(m => m.tickets), 1);
                      const maxResolved = Math.max(...executiveMetrics.monthlyTrends.map(m => m.resolved), 1);
                      const minResolved = Math.min(...executiveMetrics.monthlyTrends.map(m => m.resolved), 1);
                      
                      // Dynamic scaling based on actual data range
                      const ticketRange = maxTickets - minTickets;
                      const resolvedRange = maxResolved - minResolved;
                      
                      // Calculate heights dynamically (15% to 85% range)
                      const totalHeight = ticketRange > 0 ? 
                        Math.max(15, 15 + ((month.tickets - minTickets) / ticketRange) * 70) : 50;
                      const resolvedHeight = resolvedRange > 0 ? 
                        Math.max(15, 15 + ((month.resolved - minResolved) / resolvedRange) * 70) : 50;
                      
                      console.log(`Month ${month.month}: tickets=${month.tickets}, resolved=${month.resolved}, totalHeight=${totalHeight}%, resolvedHeight=${resolvedHeight}%`);
                      console.log(`Range: tickets(${minTickets}-${maxTickets}), resolved(${minResolved}-${maxResolved})`);
                      
                      return (
                        <div key={index} className="month-bar">
                          <div className="bar-label">{month.month}</div>
                          <div className="bar-container">
                            <div 
                              className="bar total" 
                              style={{ 
                                height: `${totalHeight}%`,
                                minHeight: '15px',
                                backgroundColor: '#60a5fa'
                              }}
                            ></div>
                            <div 
                              className="bar resolved" 
                              style={{ 
                                height: `${resolvedHeight}%`,
                                minHeight: '15px',
                                backgroundColor: '#4ade80'
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{month.tickets}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item"><span className="legend-color total" style={{backgroundColor: '#60a5fa'}}></span> Total</span>
                    <span className="legend-item"><span className="legend-color resolved" style={{backgroundColor: '#4ade80'}}></span> Resolved</span>
                  </div>
                </div>

                <div className="trend-summary">
                  <h4>Key Insights</h4>
                  <div className="insights-list">
                    <div className="insight-item">
                      <span className="insight-icon">📈</span>
                      <div className="insight-content">
                        <strong>Growth Trend:</strong> Ticket volume increased by 15% this month
                      </div>
                    </div>
                    <div className="insight-item">
                      <span className="insight-icon">⏱️</span>
                      <div className="insight-content">
                        <strong>Resolution Time:</strong> Average resolution time improved by 2 hours
                      </div>
                    </div>
                    <div className="insight-item">
                      <span className="insight-icon">😊</span>
                      <div className="insight-content">
                        <strong>Customer Satisfaction:</strong> Satisfaction score increased to 4.3/5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategic' && (
            <div className="strategic-section">
              <h3>Strategic Insights & Recommendations</h3>
              <div className="strategic-grid">
                <div className="strategic-card">
                  <h4>Performance Highlights</h4>
                  <div className="highlight-list">
                    <div className="highlight-item positive">
                      <span className="highlight-icon">✅</span>
                      <div className="highlight-content">
                        <strong>Resolution Rate:</strong> {
                          executiveMetrics.totalTickets > 0 
                            ? Math.round((executiveMetrics.resolvedTickets / executiveMetrics.totalTickets) * 100)
                            : 0
                        }% of tickets resolved successfully
                      </div>
                    </div>
                    <div className="highlight-item positive">
                      <span className="highlight-icon">🚀</span>
                      <div className="highlight-content">
                        <strong>Average Resolution Time:</strong> {executiveMetrics.avgResolutionTime} hours
                      </div>
                    </div>
                    <div className="highlight-item positive">
                      <span className="highlight-icon">😊</span>
                      <div className="highlight-content">
                        <strong>Customer Satisfaction:</strong> {executiveMetrics.customerSatisfaction}/5 average rating
                      </div>
                    </div>
                    <div className="highlight-item info">
                      <span className="highlight-icon">👥</span>
                      <div className="highlight-content">
                        <strong>Active Support Team:</strong> {agents.length} agents handling {getTicketsByStatus('in_progress').length} active tickets
                      </div>
                    </div>
                  </div>
                </div>

                <div className="strategic-card">
                  <h4>Strategic Recommendations</h4>
                  <div className="recommendation-list">
                    <div className="recommendation-item">
                      <h5>1. Expand Support Team</h5>
                      <p>Consider hiring 2 additional support executives to handle increased ticket volume</p>
                    </div>
                    <div className="recommendation-item">
                      <h5>2. Implement AI Chatbot</h5>
                      <p>Deploy AI-powered chatbot to handle 30% of routine inquiries automatically</p>
                    </div>
                    <div className="recommendation-item">
                      <h5>3. Enhanced Training Program</h5>
                      <p>Invest in advanced training for support team to reduce escalation rate</p>
                    </div>
                  </div>
                </div>

                <div className="strategic-card">
                  <h4>ROI Analysis</h4>
                  <div className="roi-metrics">
                    <div className="roi-item">
                      <span className="roi-label">Customer Retention</span>
                      <span className="roi-value">94%</span>
                    </div>
                    <div className="roi-item">
                      <span className="roi-label">Support Cost per Ticket</span>
                      <span className="roi-value">$12.50</span>
                    </div>
                    <div className="roi-item">
                      <span className="roi-label">Revenue Impact</span>
                      <span className="roi-value">+$45K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CEODashboard; 