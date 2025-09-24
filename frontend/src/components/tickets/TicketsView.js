import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import './TicketsView.css';

const TicketsView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [filteredTickets, setFilteredTickets] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get product filter from URL
  const productFilter = searchParams.get('product');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      filterTickets();
    }
  }, [tickets, productFilter]);

  const handleLogout = () => {
    localStorage.removeItem('tickUser');
    localStorage.removeItem('token');
    localStorage.removeItem('agentData');
    localStorage.removeItem('agentToken');
    navigate('/');
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('userToken');
      console.log('🔑 Using token for API request:', token ? 'Token found' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTickets(data.data);
        } else {
          setError('Failed to fetch tickets');
        }
      } else {
        console.error('❌ Failed to fetch tickets:', response.status, response.statusText);
        setError('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    if (!productFilter) {
      setFilteredTickets(tickets);
      return;
    }

    const filtered = tickets.filter(ticket => {
      // Check if ticket has product_id that matches
      if (ticket.product_id) {
        // This would need to be enhanced to check product name by ID
        return true;
      }
      
      // Check if product name matches (case-insensitive)
      if (ticket.product && typeof ticket.product === 'string') {
        const ticketProduct = ticket.product.toLowerCase().trim();
        const filterProduct = productFilter.toLowerCase().trim();
        
        return ticketProduct === filterProduct || 
               ticketProduct.includes(filterProduct) || 
               filterProduct.includes(ticketProduct);
      }
      
      return false;
    });

    setFilteredTickets(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'escalated': return '#ef4444';
      case 'closed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return '🆕 New';
      case 'in_progress': return '🔄 In Progress';
      case 'escalated': return '🚨 Escalated';
      case 'closed': return '✅ Closed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="tickets-view-loading">
        <div className="loading-spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tickets-view-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={fetchTickets} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="tickets-view">
      <div className="tickets-header">
        <div className="header-top">
          <h1>🎫 Tickets</h1>
        </div>
        {productFilter && (
          <div className="product-filter-info">
            <span>Filtered by product: <strong>{productFilter}</strong></span>
            <a href="/tickets" className="clear-filter-btn">✕ Clear Filter</a>
          </div>
        )}
        <p>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
          {productFilter && ` for "${productFilter}"`}
        </p>
      </div>

      <div className="tickets-stats">
        <div className="stat-card">
          <div className="stat-number">
            <span>📊</span>
            <span>{filteredTickets.length}</span>
          </div>
          <h3>Total</h3>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            <span>🆕</span>
            <span>{filteredTickets.filter(t => t.status === 'new').length}</span>
          </div>
          <h3>New</h3>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            <span>🔄</span>
            <span>{filteredTickets.filter(t => t.status === 'in_progress').length}</span>
          </div>
          <h3>In Progress</h3>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            <span>🚨</span>
            <span>{filteredTickets.filter(t => t.status === 'escalated').length}</span>
          </div>
          <h3>Escalated</h3>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            <span>✅</span>
            <span>{filteredTickets.filter(t => t.status === 'closed').length}</span>
          </div>
          <h3>Closed</h3>
        </div>
      </div>

      <div className="ticket-table-container">
        {filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <h2>📭 No Tickets Found</h2>
            <p>
              {productFilter 
                ? `No tickets found for product "${productFilter}".` 
                : 'No tickets found in the system.'}
            </p>
          </div>
        ) : (
          <div className="tickets-table">
            <div className="table-header">
              <div className="header-cell sortable">
                ISSUE TITLE
                <span className="sort-icon">↕️</span>
              </div>
              <div className="header-cell sortable">
                CUSTOMER
                <span className="sort-icon">↕️</span>
              </div>
              <div className="header-cell sortable">
                PRODUCT
                <span className="sort-icon">↕️</span>
              </div>
              <div className="header-cell sortable">
                STATUS
                <span className="sort-icon">↕️</span>
              </div>
              <div className="header-cell sortable">
                CREATED
                <span className="sort-icon">↕️</span>
              </div>
              <div className="header-cell">ACTIONS</div>
            </div>
            
            <div className="table-body">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="table-row">
                  <div className="table-cell">
                    {ticket.issue_title || 'No Title'}
                  </div>
                  <div className="table-cell">
                    <div className="customer-info-cell">
                      <div className="customer-name">{ticket.name}</div>
                      <div className="customer-email">{ticket.email}</div>
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className="product-badge">{ticket.product}</span>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${ticket.status}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <div className="table-cell">
                    {formatDate(ticket.created_at)}
                  </div>
                  <div className="table-cell">
                    <button 
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ticket/${ticket.id}`, { 
                          state: { 
                            from: 'tickets-view',
                            returnPath: '/tickets',
                            activeTab: 'table',
                            selectedProduct: productFilter
                          } 
                        });
                      }}
                    >
                      View Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsView; 