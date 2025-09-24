import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductDashboard.css';

const ProductDashboard = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Fetch products and tickets
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products
      const productsResponse = await fetch('http://localhost:5000/api/sla/products');
      const productsData = await productsResponse.json();

      // Fetch tickets
      const ticketsResponse = await fetch('http://localhost:5000/api/tickets');
      const ticketsData = await ticketsResponse.json();

      if (productsData.success && ticketsData.success) {
        console.log('📦 Products fetched:', productsData.data);
        console.log('🎫 Tickets fetched:', ticketsData.data);
        console.log('🎫 Sample ticket structure:', ticketsData.data[0]);
        
        setProducts(productsData.data);
        setTickets(ticketsData.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get detailed product statistics
  const getProductStats = (productId) => {
    // Get the product name for comparison
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.warn(`⚠️ Product with ID ${productId} not found`);
      return {
        total: 0,
        active: 0,
        opened: 0,
        new: 0,
        inProgress: 0,
        escalated: 0,
        closed: 0
      };
    }

    // Filter tickets by both product_id and product name
    const productTickets = tickets.filter(ticket => {
      // Check if ticket has product_id that matches
      if (ticket.product_id === productId) {
        return true;
      }
      
      // If no product_id, check if product name matches (case-insensitive)
      if (ticket.product && typeof ticket.product === 'string' && ticket.product.trim() !== '') {
        const ticketProduct = ticket.product.toLowerCase().trim();
        const productName = product.name.toLowerCase().trim();
        
        // Exact match
        if (ticketProduct === productName) {
          return true;
        }
        
        // Handle special cases for product name variations
        if (productName.includes('grc') && ticketProduct.includes('grc')) {
          return true;
        }
        
        // Partial match (in case there are slight variations)
        if (ticketProduct.includes(productName) || productName.includes(ticketProduct)) {
          return true;
        }
      }
      return false;
    });
    
    console.log(`🔍 Product "${product.name}" (ID: ${productId}) tickets:`, productTickets.length, productTickets.map(t => ({ id: t.id, product: t.product, product_id: t.product_id, status: t.status })));
    
    const totalTickets = productTickets.length;
    
    // Detailed breakdown by status
    const newTickets = productTickets.filter(ticket => ticket.status === 'new').length;
    const inProgressTickets = productTickets.filter(ticket => ticket.status === 'in_progress').length;
    const escalatedTickets = productTickets.filter(ticket => ticket.status === 'escalated').length;
    const closedTickets = productTickets.filter(ticket => ticket.status === 'closed').length;
    
    // Active tickets (new + in_progress + escalated)
    const activeTickets = newTickets + inProgressTickets + escalatedTickets;
    
    // Opened tickets (new + in_progress)
    const openedTickets = newTickets + inProgressTickets;

    return {
      total: totalTickets,
      active: activeTickets,
      opened: openedTickets,
      new: newTickets,
      inProgress: inProgressTickets,
      escalated: escalatedTickets,
      closed: closedTickets
    };
  };

  // Get overall system statistics
  const getSystemStats = () => {
    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t => t.status !== 'closed').length;
    const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;
    const newTickets = tickets.filter(t => t.status === 'new').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const ticketsWithoutProduct = tickets.filter(t => !t.product_id && (!t.product || t.product.trim() === '')).length;

    return {
      totalTickets,
      activeTickets,
      escalatedTickets,
      newTickets,
      inProgressTickets,
      ticketsWithoutProduct
    };
  };

  // Handle product click - navigate to tickets view
  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Navigate to business tickets view with product filter (no auth required)
      navigate(`/business-tickets?product=${encodeURIComponent(product.name)}`);
    }
  };

  // Handle product selection for detailed view
  const handleProductSelect = (product) => {
    setSelectedProduct(selectedProduct?.id === product.id ? null : product);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'escalated': return '#ef4444';
      case 'closed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const systemStats = getSystemStats();

  if (loading) {
    return (
      <div className="product-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-dashboard-error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="product-dashboard">
      <div className="dashboard-header" style={{
        background: 'transparent !important',    /* FORCED: Completely transparent background */
        backgroundColor: 'transparent !important', /* FORCED: Remove any background color */
        color: '#333',
        padding: '20px 0',
        textAlign: 'left',
        border: 'none',
        boxShadow: 'none'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          color: '#1a1a1a',
          position: 'relative'
        }}>
          Product Dashboard
        </h1>
      </div>

      {/* System Overview Stats - REMOVED */}

      <div className="products-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '25px',
        marginTop: '30px'
      }}>
        {products.map(product => {
          const stats = getProductStats(product.id);
          const isSelected = selectedProduct?.id === product.id;
          
          return (
            <div 
              key={product.id} 
              className={`product-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleProductSelect(product)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'none',
                transform: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
            >
              <div className="product-header">
                <h3>{product.name}</h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: 'none',
                  color: '#333',
                  border: '1px solid #ccc'
                }}>
                  {product.status}
                </span>
              </div>
              
              <div className="product-description">
                <p>{product.description || 'No description available'}</p>
              </div>

              {/* Enhanced Statistics */}
              <div className="product-stats-enhanced">
                <div className="stats-row">
                  <div className="stat-item total" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span className="stat-label">📊 Total Tickets</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.total}</span>
                  </div>
                  <div className="stat-item active" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span className="stat-label">⚡ Active</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.active}</span>
                  </div>
                </div>
                
                <div className="stats-row">
                  <div className="stat-item opened" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span className="stat-label">🔓 Opened</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.opened}</span>
                  </div>
                  <div className="stat-item escalated" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span className="stat-label">🚨 Escalated</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.escalated}</span>
                  </div>
                </div>

                {/* Detailed breakdown - always visible */}
                <div className="detailed-stats">
                  <div className="stat-item new" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}>
                    <span className="stat-label">🆕 New</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.new}</span>
                  </div>
                  <div className="stat-item in-progress" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}>
                    <span className="stat-label">🔄 In Progress</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.inProgress}</span>
                  </div>
                  <div className="stat-item closed" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    borderLeft: 'none',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.85rem'
                  }}>
                    <span className="stat-label">✅ Closed</span>
                    <span className="stat-value" style={{ color: '#333' }}>{stats.closed}</span>
                  </div>
                </div>
              </div>

              <div className="product-footer">
                <span className="created-by">
                  Created by: {product.created_by_name || 'Unknown'}
                </span>
                <span className="created-date">
                  {formatDate(product.created_at)}
                </span>
              </div>

              <div className="product-actions">
                <button 
                  className="view-tickets-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                >
                  View Tickets ({stats.total})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <h2>📦 No Products Found</h2>
          <p>No products have been created yet. Create your first product to get started.</p>
        </div>
      )}

      {/* Show information about tickets without proper product association */}
      {systemStats.ticketsWithoutProduct > 0 && (
        <div className="tickets-without-product-info">
          <h3>⚠️ Tickets Without Product Association</h3>
          <p>
            There are {systemStats.ticketsWithoutProduct} tickets that don't have a proper product association. 
            These tickets won't appear in the product statistics above.
          </p>
          <p>
            <strong>To fix this:</strong> Update these tickets to assign them to the correct product.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard; 