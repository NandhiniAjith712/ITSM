import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessDashboard.css';


const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteSLAConfirm, setDeleteSLAConfirm] = useState(null);
  const [deleteAgentConfirm, setDeleteAgentConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'sla', 'agents'
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    status: 'active'
  });



  // New state for agent management
  const [agents, setAgents] = useState([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    role: 'support_executive'
  });

  // New state for SLA management
  const [modules, setModules] = useState([]);
  const [slaConfigurations, setSlaConfigurations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddSLA, setShowAddSLA] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingSLA, setEditingSLA] = useState(null);
  const [newModule, setNewModule] = useState({
    product_id: '',
    name: '',
    description: '',
    status: 'active'
  });
  const [newSLA, setNewSLA] = useState({
    product_id: '',
    module_id: '',
    issue_name: '',
    response_time_minutes: 480,
    resolution_time_minutes: 960,
    priority_level: 'P2',
    issue_description: '',
    is_active: true
  });

  // SLA Timer state
  const [slaTimers, setSlaTimers] = useState({});

  // Performance Rate state
  const [performanceRates, setPerformanceRates] = useState([]);

  // Current user state
  const [currentUser, setCurrentUser] = useState(null);

  // Success notification state
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Error notification state
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // Sorting state for Products table
  const [productsSortField, setProductsSortField] = useState(null);
  const [productsSortDirection, setProductsSortDirection] = useState('asc');

  // Sorting state for Modules table
  const [modulesSortField, setModulesSortField] = useState(null);
  const [modulesSortDirection, setModulesSortDirection] = useState('asc');

  // Sorting state for SLA Configurations table
  const [slaSortField, setSlaSortField] = useState(null);
  const [slaSortDirection, setSlaSortDirection] = useState('asc');

  // Sorting state for Agents table
  const [agentsSortField, setAgentsSortField] = useState(null);
  const [agentsSortDirection, setAgentsSortDirection] = useState('asc');




  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Show success notification
  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000); // Auto-hide after 3 seconds
  };

  // Show error notification
  const showErrorNotification = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setErrorMessage('');
    }, 4000); // Auto-hide after 4 seconds (errors stay longer)
  };
  console.log('🔧 API_BASE configured as:', API_BASE);

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

  // Get current user from localStorage
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('tickUser');
    const storedAgent = localStorage.getItem('agentData');
    
    if (storedUser) {
      return JSON.parse(storedUser);
    } else if (storedAgent) {
      return JSON.parse(storedAgent);
    }
    return null;
  };

  // Check if user has permission to access business dashboard
  const hasBusinessAccess = () => {
    const currentUser = getCurrentUser();
    return currentUser && (currentUser.role === 'support_manager' || currentUser.role === 'ceo');
  };



  // Handle attachment viewing




  // Fetch all agents
  const fetchAgents = async () => {
    try {
      const agentsRes = await fetch(`${API_BASE}/agents`);
      const agentsJson = await agentsRes.json();

      const agents = agentsJson.success ? agentsJson.data : [];
      const sortedAgents = agents.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setAgents(sortedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Add new agent
  const handleAddAgent = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔍 Original newAgent state:', newAgent);
      
      // Client-side validation
      if (newAgent.name.trim().length < 2) {
        alert('Name must be at least 2 characters long');
        return;
      }
      
      if (!newAgent.email || !newAgent.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Clean up the data before sending
      const agentData = {
        name: newAgent.name.trim(),
        email: newAgent.email.trim(),
        role: newAgent.role || 'support_executive'
      };
      
      console.log('📤 Sending agent data:', agentData);
      
      const response = await fetch(`${API_BASE}/agents/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentData)
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        setShowAddAgent(false);
        setNewAgent({
          name: '',
          email: '',
          role: 'support_executive'
        });
        fetchAgents(); // Refresh the agents list
        
        // Display generated credentials
        const { credentials } = data.data;
        const credentialsMessage = `
🎉 Agent added successfully!

📋 Generated Login Credentials:
• Login ID: ${credentials.login_id}
• Password: ${credentials.password}

⚠️  IMPORTANT: Please save these credentials securely!
   The password cannot be retrieved later.

🔐 Staff can now login at: /staff/login
        `;
        
        alert(credentialsMessage);
        showSuccessNotification('Staff member added successfully!');
      } else {
        console.error(' Agent registration failed:', data);
        
        // Show specific validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => `${error.path}: ${error.msg}`);
          alert(`Validation failed:\n${errorMessages.join('\n')}`);
        } else {
          showErrorNotification(data.message || 'Failed to add staff member');
        }
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      showErrorNotification('Failed to add staff member. Please try again.');
    }
  };

  // Edit agent
  const handleEditAgent = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔍 Editing agent:', editingAgent);
      
      // Client-side validation
      if (editingAgent.name.trim().length < 2) {
        alert('Name must be at least 2 characters long');
        return;
      }
      
      if (!editingAgent.email || !editingAgent.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Clean up the data before sending
      const agentData = {
        name: editingAgent.name.trim(),
        email: editingAgent.email.trim(),
        role: editingAgent.role || 'agent',
        is_active: editingAgent.is_active
      };
      
      console.log('📤 Sending updated agent data:', agentData);
      
      const response = await fetch(`${API_BASE}/agents/${editingAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentData)
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        setEditingAgent(null);
        fetchAgents(); // Refresh the agents list
        showSuccessNotification('Staff member updated successfully!');
      } else {
        console.error('❌ Agent update failed:', data);
        
        // Show specific validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => `${error.path}: ${error.msg}`);
          alert(`Validation failed:\n${errorMessages.join('\n')}`);
        } else {
          showErrorNotification(data.message || 'Failed to update staff member');
        }
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      showErrorNotification('Failed to update staff member. Please try again.');
    }
  };

  // Delete agent
  const handleDeleteAgent = async (agentId) => {
    // Get agent details for better confirmation
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      alert(' Agent not found');
      return;
    }

    // Set the agent to be deleted for confirmation modal
    setDeleteAgentConfirm(agent);
  };

  // Confirm delete agent
  const confirmDeleteAgent = async () => {
    if (!deleteAgentConfirm) return;
    
    try {
      console.log(' Deleting agent with ID:', deleteAgentConfirm.id);
      
      const response = await fetch(`${API_BASE}/agents/${deleteAgentConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Agent deleted successfully:', data.message);
        
        // Show success message with details
        const message = `✅ Agent "${deleteAgentConfirm.name}" deleted successfully!`;
        
        showSuccessNotification('Staff member deleted successfully!');
        
        // Refresh the agents list
        fetchAgents();
      } else {
        console.error(' Failed to delete agent:', data.message);
        alert(' Failed to delete agent: ' + data.message);
      }
    } catch (error) {
      console.error(' Error deleting agent:', error);
      alert(' Error deleting agent. Please try again.');
    } finally {
      setDeleteAgentConfirm(null);
    }
  };

  // Debug products state changes
  useEffect(() => {
    console.log('🔍 Products state changed:', products);
    console.log('🔍 Products length:', products ? products.length : 'undefined');
    if (products && products.length > 0) {
      console.log('🔍 First product:', products[0]);
    }
  }, [products]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products from:', `${API_BASE}/sla/products`);
      const response = await fetch(`${API_BASE}/sla/products`);
      console.log('📡 Products response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Products data:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} products`);
        setProducts(data.data);
        setError(''); // Clear any previous errors
        // Auto-select the first product if none is selected
        if (!selectedProduct && data.data.length > 0) {
          console.log('🎯 Auto-selecting first product:', data.data[0].name);
          setSelectedProduct(data.data[0]);
          fetchModules(data.data[0].id);
        }
      } else {
        console.error(' API returned error:', data.message);
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error(' Error fetching products:', error);
      setError('Failed to fetch products');
    }
  };



  useEffect(() => {
    console.log('🚀 BusinessDashboard useEffect triggered');
    setLoading(true); // Set loading to true when starting
    
    const initializeDashboard = async () => {
      try {
        await fetchProducts();
        await fetchAgents();
      } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };
    
    initializeDashboard();
  }, []);

  // Prevent body scroll when modals are open
  useEffect(() => {
    const isModalOpen = showAddForm || showAddAgent || showAddModule || showAddSLA || 
                       editingProduct || editingAgent || editingModule || editingSLA ||
                       deleteConfirm || deleteSLAConfirm || deleteAgentConfirm;
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm, showAddAgent, showAddModule, showAddSLA, 
      editingProduct, editingAgent, editingModule, editingSLA,
      deleteConfirm, deleteSLAConfirm, deleteAgentConfirm]);





  // Fetch modules for a specific product
  const fetchModules = async (productId) => {
    try {
      console.log('🔍 Fetching modules for product:', productId);
      const response = await fetch(`${API_BASE}/sla/modules`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} modules`);
        // Filter modules by the selected product
        const productModules = data.data.filter(module => module.product_id == productId);
        console.log(`🎯 Product ${productId} has ${productModules.length} modules`);
        setModules(productModules);
      } else {
        console.error(' Failed to fetch modules:', data.message);
      }
    } catch (error) {
      console.error(' Error fetching modules:', error);
    }
  };

  // Fetch SLA configurations
  const fetchSLAConfigurations = async () => {
    try {
      const response = await fetch(`${API_BASE}/sla/configurations`);
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 SLA Configurations fetched:', data.data);
        setSlaConfigurations(data.data);
      } else {
        console.error('Failed to fetch SLA configurations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching SLA configurations:', error);
    }
  };

  // Fetch SLA performance rates
  const fetchPerformanceRates = async () => {
    try {
      console.log('🔍 Fetching SLA performance rates...');
      console.log('🔍 API_BASE:', API_BASE);
      console.log('🔍 Full URL:', `${API_BASE}/sla/performance-rates`);
      
      const response = await fetch(`${API_BASE}/sla/performance-rates`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        console.log('📊 Performance Rates fetched:', data.data);
        console.log('📊 Performance Rates count:', data.data ? data.data.length : 0);
        setPerformanceRates(data.data || []);
      } else {
        console.error('❌ Failed to fetch performance rates:', data.message);
        setPerformanceRates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching performance rates:', error);
      setPerformanceRates([]);
    }
  };

  // Handle product selection for SLA management
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    fetchModules(product.id);
  };

  // Add new module
  const handleAddModule = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/sla/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newModule)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddModule(false);
        setNewModule({
          product_id: '',
          name: '',
          description: '',
          status: 'active'
        });
        fetchModules(selectedProduct.id);
        showSuccessNotification('Module added successfully!');
      } else {
        alert(data.message || 'Failed to add module');
      }
    } catch (error) {
      console.error('Error adding module:', error);
      alert('Failed to add module');
    }
  };

  // Add new SLA configuration
  const handleAddSLA = async (e) => {
    e.preventDefault();
    
    try {
      console.log('+ Adding new SLA configuration:', newSLA);
      console.log('+ API endpoint:', `${API_BASE}/sla/configurations`);
      
      const response = await fetch(`${API_BASE}/sla/configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSLA)
      });
      
      console.log('+ Response status:', response.status);
      const data = await response.json();
      console.log('+ Response data:', data);
      
      if (data.success) {
        setShowAddSLA(false);
        setNewSLA({
          product_id: '',
          module_id: '',
          issue_name: '',
          response_time_minutes: 480,
          resolution_time_minutes: 960,
          priority_level: 'P2',
          issue_description: '',
          is_active: true
        });
        fetchSLAConfigurations();
        showSuccessNotification('SLA configuration added successfully!');
      } else {
        alert(data.message || 'Failed to add SLA configuration');
      }
    } catch (error) {
      console.error('Error adding SLA configuration:', error);
      alert('Failed to add SLA configuration');
    }
  };

  // Edit SLA configuration
  const handleEditSLA = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔧 Editing SLA configuration:', editingSLA);
      console.log('🔧 API endpoint:', `${API_BASE}/sla/configurations/${editingSLA.id}`);
      
      // Prepare the data to send (only the fields the backend expects)
      const updateData = {
        issue_name: editingSLA.issue_name,
        issue_description: editingSLA.issue_description || null,
        response_time_minutes: editingSLA.response_time_minutes,
        resolution_time_minutes: editingSLA.resolution_time_minutes,
        priority_level: editingSLA.priority_level,
        is_active: editingSLA.is_active
      };
      
      console.log('🔧 Data being sent to backend:', updateData);
      
      const response = await fetch(`${API_BASE}/sla/configurations/${editingSLA.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('🔧 Response status:', response.status);
      const data = await response.json();
      console.log('🔧 Response data:', data);
      
      if (data.success) {
        setShowAddSLA(false);
        setEditingSLA(null);
        fetchSLAConfigurations();
        showSuccessNotification('SLA configuration updated successfully!');
      } else {
        alert(data.message || 'Failed to update SLA configuration');
      }
    } catch (error) {
      console.error('Error updating SLA configuration:', error);
      alert('Failed to update SLA configuration');
    }
  };

  // Delete SLA configuration
  const handleDeleteSLA = async (slaId) => {
    // Find the SLA configuration to get its details
    const slaConfig = slaConfigurations.find(config => config.id === slaId);
    if (slaConfig) {
      setDeleteSLAConfirm(slaConfig);
    }
  };

  // Confirm delete SLA configuration
  const confirmDeleteSLA = async () => {
    if (!deleteSLAConfirm) return;
    
    try {
      const response = await fetch(`${API_BASE}/sla/configurations/${deleteSLAConfirm.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchSLAConfigurations();
        setDeleteSLAConfirm(null);
        showSuccessNotification('SLA configuration deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete SLA configuration');
      }
    } catch (error) {
      console.error('Error deleting SLA configuration:', error);
      alert('Failed to delete SLA configuration');
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId) => {
    // Removed window.confirm - using modal confirmation instead
    
    try {
      const response = await fetch(`${API_BASE}/sla/modules/${moduleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchModules(selectedProduct.id);
        showSuccessNotification('Module deleted successfully!');
      } else {
        const data = await response.json();
        alert(` Failed to delete module: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert(' Failed to delete module. Please try again.');
    }
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/sla/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description || '',
          status: newProduct.status
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          status: 'active'
        });
        fetchProducts(); // Refresh the list
        showSuccessNotification('Product added successfully!');
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  };

  // Edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/sla/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description || '',
          status: editingProduct.status
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEditingProduct(null);
        fetchProducts(); // Refresh the list
        showSuccessNotification('Product updated successfully!');
      } else {
        showErrorNotification(`Failed to update product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showErrorNotification('Failed to update product. Please try again.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    // Removed window.confirm - using modal confirmation instead
    
    try {
      const response = await fetch(`${API_BASE}/sla/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchProducts(); // Refresh the list
        showSuccessNotification('Product deleted successfully!');
      } else {
        const data = await response.json();
        alert(` Failed to delete product: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(' Failed to delete product. Please try again.');
    }
  };





  // Format SLA hours
  const formatSLAHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  // Format SLA timer display
  const formatSLATimer = (timer) => {
    if (!timer) return 'N/A';
    
    const { remaining_minutes, is_breached, is_warning } = timer;
    
    if (is_breached) {
      return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🚨 BREACHED</span>;
    }
    
    if (is_warning) {
      return <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ {formatSLAHours(remaining_minutes)}</span>;
    }
    
    return <span style={{ color: '#10b981' }}>⏱️ {formatSLAHours(remaining_minutes)}</span>;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return 'transparent';
      case 'P1': return 'transparent';
      case 'P2': return 'transparent';
      case 'P3': return 'transparent';
      default: return 'transparent';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'P0': return 'Critical';
      case 'P1': return 'High';
      case 'P2': return 'Medium';
      case 'P3': return 'Low';
      default: return 'Unknown';
    }
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

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'escalated': return 'Escalated';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  // Sorting function for Products table
  const sortProducts = (products, field, direction) => {
    if (!field) return products;
    
    return [...products].sort((a, b) => {
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

  // Handle sort click for Products table
  const handleProductsSort = (field) => {
    if (productsSortField === field) {
      // Same field clicked - toggle direction
      setProductsSortDirection(productsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setProductsSortField(field);
      setProductsSortDirection('asc');
    }
  };

  // Sorting function for Modules table
  const sortModules = (modules, field, direction) => {
    if (!field) return modules;
    
    return [...modules].sort((a, b) => {
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

  // Handle sort click for Modules table
  const handleModulesSort = (field) => {
    if (modulesSortField === field) {
      // Same field clicked - toggle direction
      setModulesSortDirection(modulesSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setModulesSortField(field);
      setModulesSortDirection('asc');
    }
  };

  // Sorting function for SLA Configurations table
  const sortSLAConfigurations = (configurations, field, direction) => {
    if (!field) return configurations;
    
    return [...configurations].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle numeric sorting for response_time and resolution_time
      if (field === 'response_time') {
        aValue = parseInt(a.response_time_minutes) || 0;
        bValue = parseInt(b.response_time_minutes) || 0;
      } else if (field === 'resolution_time') {
        aValue = parseInt(a.resolution_time_minutes) || 0;
        bValue = parseInt(b.resolution_time_minutes) || 0;
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

  // Handle sort click for SLA Configurations table
  const handleSLASort = (field) => {
    if (slaSortField === field) {
      // Same field clicked - toggle direction
      setSlaSortDirection(slaSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setSlaSortField(field);
      setSlaSortDirection('asc');
    }
  };

  // Sorting function for Agents table
  const sortAgents = (agents, field, direction) => {
    if (!field) return agents;
    
    return [...agents].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle date sorting for last_login
      if (field === 'last_login') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
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

  // Handle sort click for Agents table
  const handleAgentsSort = (field) => {
    if (agentsSortField === field) {
      // Same field clicked - toggle direction
      setAgentsSortDirection(agentsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field clicked - set field and default to ascending
      setAgentsSortField(field);
      setAgentsSortDirection('asc');
    }
  };





  console.log('🔄 BusinessDashboard render - loading:', loading, 'products:', products.length, 'error:', error);
  
  if (loading) {
    return (
      <div className="business-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="business-dashboard-new">
      <div className="dashboard-header-new">
        <div className="page-title-new">
          <div className="title-content">
            <div className="title-text">
              <h1>Business Team Dashboard</h1>
              <p>Manage your products, SLA settings, and team agents</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="product-dashboard-btn"
              onClick={() => navigate('/business-products')}
            >
              <span className="btn-icon">⚙️</span>
              Product Dashboard
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
        <div className="dashboard-tabs-new">
          <button 
            className={`tab-new ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="tab-icon">📦</span>
            Products & SLA
          </button>
          <button 
            className={`tab-new ${activeTab === 'sla' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sla');
              fetchSLAConfigurations();
              fetchPerformanceRates();
            }}
          >
            <span className="tab-icon">⏰</span>
            SLA Management
          </button>
          <button 
            className={`tab-new ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('agents');
              fetchAgents();
            }}
          >
            <span className="tab-icon">👤</span>
            Agent Management
            <span className="agent-badge">7</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}


      {activeTab === 'products' && (
        <>
          <div className="product-management-header">
            <h2 className="product-management-title">Product Management</h2>
            <button 
              className="add-product-button"
              onClick={() => setShowAddForm(true)}
            >
              <span className="add-icon">+</span>
              Add Product
            </button>
          </div>
          <div className="product-management-container">

          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>+ Add New Product</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setShowAddForm(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="e.g., Authentication System"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Product description..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Save Product
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {editingProduct && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Edit Product: {editingProduct.name}</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setEditingProduct(null)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleEditProduct}>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      placeholder="e.g., Authentication System"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      placeholder="Product description..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {deleteConfirm && (
            <div className="modal-overlay">
              <div className="modal-content delete-confirm-modal">
                <div className="modal-header">
                  <h3>Confirm Delete</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="delete-confirm-content">
                  <p>Are you sure you want to delete this product?</p>
                  <p className="product-name">{deleteConfirm.name}</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="delete-confirm-btn"
                    onClick={() => {
                      handleDeleteProduct(deleteConfirm.id);
                      setDeleteConfirm(null);
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th 
                    className="products-header-cell sortable-header" 
                    onClick={() => handleProductsSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    PRODUCT NAME
                    {productsSortField === 'name' && (
                      <span className="sort-arrow">
                        {productsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="products-header-cell sortable-header" 
                    onClick={() => handleProductsSort('status')}
                    style={{ cursor: 'pointer' }}
                  >
                    STATUS
                    {productsSortField === 'status' && (
                      <span className="sort-arrow">
                        {productsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="products-header-cell sortable-header" 
                    onClick={() => handleProductsSort('created_at')}
                    style={{ cursor: 'pointer' }}
                  >
                    CREATED DATE
                    {productsSortField === 'created_at' && (
                      <span className="sort-arrow">
                        {productsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  sortProducts(products, productsSortField, productsSortDirection).map(product => (
                    <tr key={product.id}>
                      <td>
                        <span className="product-name">{product.name}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.status === 'active' ? 'active' : 'inactive'}`}>
                          {product.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <span className="created-date">
                          {new Date(product.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => setDeleteConfirm(product)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-products">
                      {loading ? '🔄 Loading products...' : '📦 No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}


          

          










      {activeTab === 'sla' && (
        <div className="sla-section">
          <div className="section-header">
            <h2>SLA Management</h2>
          </div>

          <div className="sla-content">
            {/* SLA Stats removed - content will fill the space */}
          </div>

          {selectedProduct && (
            <>
              {/* Modules Management */}
              <div className="modules-section">
                <div className="subsection-header">
                  <h3>🔧 Modules for {selectedProduct.name}</h3>
                  <button 
                    className="add-module-btn"
                    onClick={() => {
                      setNewModule({...newModule, product_id: selectedProduct.id});
                      setShowAddModule(true);
                    }}
                  >
                    + Add Module
                  </button>
                </div>

                {showAddModule && (
                  <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                      <div className="modal-header">
                        <h3>+ Add New Module</h3>
                        <button 
                          type="button" 
                          className="modal-close-btn"
                          onClick={() => setShowAddModule(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={handleAddModule}>
                      <div className="form-group">
                        <label>Module Name *</label>
                        <input
                          type="text"
                          value={newModule.name}
                          onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                          placeholder="e.g., User Authentication"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={newModule.description}
                          onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                          placeholder="Module description..."
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={newModule.status}
                          onChange={(e) => setNewModule({...newModule, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="save-btn">
                          Save Module
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setShowAddModule(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="modules-table">
                  <table>
                    <thead>
                      <tr>
                        <th 
                          className="modules-header-cell sortable-header" 
                          onClick={() => handleModulesSort('name')}
                          style={{ cursor: 'pointer' }}
                        >
                          MODULE NAME
                          {modulesSortField === 'name' && (
                            <span className="sort-arrow">
                              {modulesSortDirection === 'asc' ? '⬆️' : '⬇️'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="modules-header-cell sortable-header" 
                          onClick={() => handleModulesSort('description')}
                          style={{ cursor: 'pointer' }}
                        >
                          DESCRIPTION
                          {modulesSortField === 'description' && (
                            <span className="sort-arrow">
                              {modulesSortDirection === 'asc' ? '⬆️' : '⬇️'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="modules-header-cell sortable-header" 
                          onClick={() => handleModulesSort('status')}
                          style={{ cursor: 'pointer' }}
                        >
                          STATUS
                          {modulesSortField === 'status' && (
                            <span className="sort-arrow">
                              {modulesSortDirection === 'asc' ? '⬆️' : '⬇️'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="modules-header-cell sortable-header" 
                          onClick={() => handleModulesSort('created_at')}
                          style={{ cursor: 'pointer' }}
                        >
                          CREATED
                          {modulesSortField === 'created_at' && (
                            <span className="sort-arrow">
                              {modulesSortDirection === 'asc' ? '⬆️' : '⬇️'}
                            </span>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortModules(modules, modulesSortField, modulesSortDirection).map(module => (
                        <tr key={module.id}>
                          <td className="module-name">{module.name}</td>
                          <td className="module-description">
                            {module.description || 'No description'}
                          </td>
                          <td>
                            <span className={`status-badge ${module.status}`} style={module.status === 'active' ? { backgroundColor: '#d4edda', color: '#155724' } : {}}>
                              {module.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="created-date">
                            {new Date(module.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {modules.length === 0 && (
                    <div className="no-modules">
                      <p>🔧 No modules found for this product</p>
                      <p>Click the "+" button to add your first module</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SLA Configurations */}
              <div className="sla-configurations-table">
                <div className="table-header">
                  <h3>📋 SLA Configurations for {selectedProduct ? selectedProduct.name : 'All Products'}</h3>
                  <div className="table-actions">
                    <select 
                      value={selectedProduct ? selectedProduct.id : ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id == e.target.value);
                        setSelectedProduct(product || null);
                        if (product) {
                          fetchModules(product.id);
                        }
                      }}
                      className="product-selector"
                    >
                      <option value="">All Products</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="add-sla-btn"
                      onClick={() => {
                        if (selectedProduct) {
                          setNewSLA({...newSLA, product_id: selectedProduct.id});
                          setShowAddSLA(true);
                        } else {
                          alert('Please select a product first to add SLA rules');
                        }
                      }}
                    >
                      + Add SLA Rule
                    </button>
                  </div>
                </div>
                
                {showAddSLA && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>{editingSLA ? 'Edit SLA Configuration' : '+ Add New SLA Rule'}</h3>
                        <button 
                          type="button" 
                          className="modal-close-btn"
                          onClick={() => {
                            setShowAddSLA(false);
                            setEditingSLA(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={editingSLA ? handleEditSLA : handleAddSLA}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Module *</label>
                          <select
                            value={editingSLA ? editingSLA.module_id : newSLA.module_id}
                            onChange={(e) => {
                              if (editingSLA) {
                                setEditingSLA({...editingSLA, module_id: e.target.value});
                              } else {
                                setNewSLA({...newSLA, module_id: e.target.value});
                              }
                            }}
                            required
                          >
                            <option value="">Select Module</option>
                            {modules.map(module => (
                              <option key={module.id} value={module.id}>
                                {module.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Issue Type *</label>
                          <input
                            type="text"
                            value={editingSLA ? editingSLA.issue_name : newSLA.issue_name}
                            onChange={(e) => {
                              if (editingSLA) {
                                setEditingSLA({...editingSLA, issue_name: e.target.value});
                              } else {
                                setNewSLA({...newSLA, issue_name: e.target.value});
                              }
                            }}
                            placeholder="e.g., Login Issues"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Response Time (minutes) *</label>
                          <input
                            type="number"
                            value={editingSLA ? editingSLA.response_time_minutes : newSLA.response_time_minutes}
                            onChange={(e) => {
                              if (editingSLA) {
                                setEditingSLA({...editingSLA, response_time_minutes: parseInt(e.target.value)});
                              } else {
                                setNewSLA({...newSLA, response_time_minutes: parseInt(e.target.value)});
                              }
                            }}
                            min="5"
                            max="1440"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Resolution Time (minutes) *</label>
                          <input
                            type="number"
                            value={editingSLA ? editingSLA.resolution_time_minutes : newSLA.resolution_time_minutes}
                            onChange={(e) => {
                              if (editingSLA) {
                                setEditingSLA({...editingSLA, resolution_time_minutes: parseInt(e.target.value)});
                              } else {
                                setNewSLA({...newSLA, resolution_time_minutes: parseInt(e.target.value)});
                              }
                            }}
                            min="5"
                            max="1440"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Priority Level *</label>
                        <select
                          value={editingSLA ? editingSLA.priority_level : newSLA.priority_level}
                          onChange={(e) => {
                            if (editingSLA) {
                              setEditingSLA({...editingSLA, priority_level: e.target.value});
                            } else {
                              setNewSLA({...newSLA, priority_level: e.target.value});
                            }
                          }}
                          required
                        >
                          <option value="">Select Priority</option>
                          <option value="P0">P0 - Critical</option>
                          <option value="P1">P1 - High</option>
                          <option value="P2">P2 - Medium</option>
                          <option value="P3">P3 - Low</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={editingSLA ? (editingSLA.issue_description || '') : newSLA.issue_description}
                          onChange={(e) => {
                            if (editingSLA) {
                              setEditingSLA({...editingSLA, issue_description: e.target.value});
                            } else {
                              setNewSLA({...newSLA, issue_description: e.target.value});
                            }
                          }}
                          placeholder="SLA rule description..."
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={editingSLA ? (editingSLA.is_active ? 'active' : 'inactive') : (newSLA.is_active ? 'active' : 'inactive')}
                          onChange={(e) => {
                            const isActive = e.target.value === 'active';
                            if (editingSLA) {
                              setEditingSLA({...editingSLA, is_active: isActive});
                            } else {
                              setNewSLA({...newSLA, is_active: isActive});
                            }
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="save-btn">
                          {editingSLA ? 'Save Changes' : 'Save SLA Rule'}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            setShowAddSLA(false);
                            setEditingSLA(null);
                            setNewSLA({
                              product_id: '',
                              module_id: '',
                              issue_name: '',
                              response_time_minutes: 480,
                              resolution_time_minutes: 960,
                              priority_level: 'P2',
                              issue_description: '',
                              is_active: true
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {slaConfigurations.filter(config => !selectedProduct || config.product_id === selectedProduct.id).length === 0 ? (
                  <div className="no-sla-configurations">
                    <div className="empty-state">
                      <span className="empty-icon">⏱️</span>
                      <h4>No SLA Configurations Found</h4>
                      <p>No SLA rules have been configured for this product yet.</p>
                      <p>Click the "+" button to add your first SLA rule.</p>
                    </div>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="sla-table">
                      <thead>
                        <tr>
                          <th 
                            className="th-module sortable-header" 
                            onClick={() => handleSLASort('module_name')}
                            style={{ cursor: 'pointer' }}
                          >
                            MODULE
                            {slaSortField === 'module_name' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th 
                            className="th-issue sortable-header" 
                            onClick={() => handleSLASort('issue_name')}
                            style={{ cursor: 'pointer' }}
                          >
                            ISSUE TYPE
                            {slaSortField === 'issue_name' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th 
                            className="th-time sortable-header" 
                            onClick={() => handleSLASort('response_time')}
                            style={{ cursor: 'pointer' }}
                          >
                            RESPONSE TIME
                            {slaSortField === 'response_time' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th 
                            className="th-resolution sortable-header" 
                            onClick={() => handleSLASort('resolution_time')}
                            style={{ cursor: 'pointer' }}
                          >
                            RESOLUTION TIME
                            {slaSortField === 'resolution_time' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th 
                            className="th-priority sortable-header" 
                            onClick={() => handleSLASort('priority')}
                            style={{ cursor: 'pointer' }}
                          >
                            PRIORITY
                            {slaSortField === 'priority' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th 
                            className="th-status sortable-header" 
                            onClick={() => handleSLASort('status')}
                            style={{ cursor: 'pointer' }}
                          >
                            STATUS
                            {slaSortField === 'status' && (
                              <span className="sort-arrow">
                                {slaSortDirection === 'asc' ? '⬆️' : '⬇️'}
                              </span>
                            )}
                          </th>
                          <th className="th-actions">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortSLAConfigurations(
                          slaConfigurations.filter(config => !selectedProduct || config.product_id === selectedProduct.id),
                          slaSortField,
                          slaSortDirection
                        ).map(config => (
                          <tr key={config.id} className="sla-row">
                            <td className="td-module">
                              <span className="module-name">{config.module_name || 'N/A'}</span>
                            </td>
                            <td className="td-issue">
                              <span className="issue-type">{config.issue_name || 'N/A'}</span>
                              {config.issue_description && (
                                <div className="issue-description">{config.issue_description}</div>
                              )}
                            </td>
                            <td className="td-time">
                              <span className="response-time">
                                {config.response_time_minutes ? formatSLAHours(config.response_time_minutes) : 'N/A'}
                              </span>
                            </td>
                            <td className="td-resolution">
                              <span className="resolution-time">
                                {config.resolution_time_minutes ? formatSLAHours(config.resolution_time_minutes) : 'N/A'}
                              </span>
                            </td>
                            <td className="td-priority">
                              {config.priority_level ? (
                                <span 
                                  style={{ 
                                    backgroundColor: 'transparent',
                                    color: '#333',
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    display: 'inline-block',
                                    minWidth: '50px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                  }}
                                >
                                  {config.priority_level}
                                </span>
                              ) : (
                                <span style={{
                                  color: '#9ca3af',
                                  fontStyle: 'italic',
                                  fontSize: '14px'
                                }}>
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="td-status">
                              {config.is_active !== undefined ? (
                                <span className={`status-badge ${config.is_active ? 'active' : 'inactive'}`} style={config.is_active ? { backgroundColor: '#d4edda', color: '#155724' } : {}}>
                                  {config.is_active ? 'Active' : 'Inactive'}
                                </span>
                              ) : (
                                <span className="no-status">N/A</span>
                              )}
                            </td>
                            <td className="td-actions">
                              <div className="action-buttons">
                                <button 
                                  className="edit-btn"
                                  onClick={() => {
                                    setEditingSLA(config);
                                    setShowAddSLA(true);
                                  }}
                                  title="Edit SLA Configuration"
                                >
                                  Edit
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleDeleteSLA(config.id)}
                                  title="Delete SLA Configuration"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Performance Rate Table */}
              <div className="performance-rates-table">
                <div className="table-header">
                  <h3>📊 SLA Performance Rates</h3>
                  <p className="table-description">Performance rates calculated based on SLA configurations</p>
                  <button 
                    onClick={fetchPerformanceRates}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Refresh Performance Rates
                  </button>
                </div>
                
                {/* Debug info - remove this later */}
                <div style={{padding: '10px', background: '#f0f0f0', margin: '10px', borderRadius: '4px', fontSize: '12px'}}>
                  <strong>Debug Info:</strong><br/>
                  Performance Rates Array Length: {performanceRates.length}<br/>
                  Performance Rates Data: {JSON.stringify(performanceRates, null, 2)}
                </div>
                
                {performanceRates.length === 0 ? (
                  <div className="no-performance-rates">
                    <div className="empty-state">
                      <span className="empty-icon">📊</span>
                      <h4>No Performance Data Available</h4>
                      <p>Performance rates will be calculated based on SLA configurations.</p>
                    </div>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th className="th-product">PRODUCT</th>
                          <th className="th-module">MODULE</th>
                          <th className="th-issue">ISSUE TYPE</th>
                          <th className="th-response-rate">RESPONSE TIME PERFORMANCE RATE</th>
                          <th className="th-resolution-rate">RESOLUTION TIME PERFORMANCE RATE</th>
                          <th className="th-overall-rate">OVERALL PERFORMANCE RATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceRates.map(rate => (
                          <tr key={rate.id} className="performance-row">
                            <td className="td-product">
                              <span className="product-name">{rate.product_name || 'N/A'}</span>
                            </td>
                            <td className="td-module">
                              <span className="module-name">{rate.module_name || 'N/A'}</span>
                            </td>
                            <td className="td-issue">
                              <span className="issue-type">{rate.issue_name || 'N/A'}</span>
                            </td>
                            <td className="td-response-rate">
                              <span className={`performance-rate ${rate.response_time_performance_rate > 100 ? 'exceeded' : 'within-limit'}`}>
                                {rate.response_time_performance_rate}%
                              </span>
                            </td>
                            <td className="td-resolution-rate">
                              <span className={`performance-rate ${rate.resolution_time_performance_rate > 100 ? 'exceeded' : 'within-limit'}`}>
                                {rate.resolution_time_performance_rate}%
                              </span>
                            </td>
                            <td className="td-overall-rate">
                              <span className={`performance-rate overall ${rate.overall_performance_rate > 100 ? 'exceeded' : 'within-limit'}`}>
                                {rate.overall_performance_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SLA Delete Confirmation Modal */}
          {deleteSLAConfirm && (
            <div className="modal-overlay">
              <div className="modal-content delete-confirm-modal">
                <div className="modal-header">
                  <h3>Confirm Delete</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setDeleteSLAConfirm(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="delete-confirm-content">
                  <p>Are you sure you want to delete this SLA configuration?</p>
                  <p className="sla-name">
                    <strong>Issue Type:</strong> {deleteSLAConfirm.issue_name}
                  </p>
                  <p className="sla-module">
                    <strong>Module:</strong> {deleteSLAConfirm.module_name || 'N/A'}
                  </p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="delete-confirm-btn"
                    onClick={confirmDeleteSLA}
                  >
                    Delete
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setDeleteSLAConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <>
          <div className="section-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="section-title">
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>👨‍💼 Agent Management</h2>
              <p className="section-info" style={{
                fontSize: '14px',
                fontWeight: 'normal',
                color: '#666',
                marginLeft: '10px',
                margin: '5px 0 0 0'
              }}>Create staff accounts with auto-generated login credentials</p>
            </div>
            <button 
              className="add-agent-btn"
              onClick={() => {
                setNewAgent({
                  name: '',
                  email: '',
                  role: 'support_executive'
                });
                setShowAddAgent(true);
              }}
            >
              + Add agent
            </button>
          </div>
          
          <div className="agents-container" style={{ 
            maxWidth: '100%', 
            margin: '0', 
            padding: '20px',
            marginRight: '0'
          }}>
            <div className="agents-section">

          {showAddAgent && (
            <div className="agent-modal-overlay">
              <div className="agent-modal-content">
                <div className="agent-modal-header">
                  <h3>+ Add New Agent</h3>
                  <button 
                    className="agent-modal-close-btn"
                    onClick={() => {
                      setNewAgent({
                        name: '',
                        email: '',
                        role: 'support_executive'
                      });
                      setShowAddAgent(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddAgent}>
                  <div className="agent-form-row">
                    <div className="agent-form-group">
                      <label>Full Name * (minimum 2 characters)</label>
                      <input
                        type="text"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                        placeholder="Enter full name (minimum 2 characters)"
                        required
                        minLength={2}
                      />
                      {newAgent.name && newAgent.name.trim().length < 2 && (
                        <small style={{color: 'red'}}>
                          Name must be at least 2 characters long
                        </small>
                      )}
                    </div>

                    <div className="agent-form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                      {newAgent.email && !newAgent.email.includes('@') && (
                        <small style={{color: 'red'}}>
                          Please enter a valid email address
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="agent-form-group">
                    <label>Role</label>
                    <select
                      value={newAgent.role || 'support_executive'}
                      onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
                      className="form-select"
                    >
                      <option value="support_executive">Support Executive</option>
                      <option value="support_manager">Support Manager</option>
                      <option value="ceo">CEO</option>
                    </select>
                    <small>Select the role for this agent</small>
                  </div>

                  <div className="agent-form-actions">
                    <button type="submit" className="agent-save-btn">
                       Save Agent
                    </button>
                    <button 
                      type="button" 
                      className="agent-cancel-btn"
                      onClick={() => {
                        setNewAgent({
                          name: '',
                          email: '',
                          role: 'support_executive'
                        });
                        setShowAddAgent(false);
                      }}
                    >
                       Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {editingAgent && (
            <div className="agent-modal-overlay">
              <div className="agent-modal-content">
                <div className="agent-modal-header">
                  <h3>Edit Agent: {editingAgent.name}</h3>
                  <button className="agent-modal-close-btn" onClick={() => setEditingAgent(null)}>✕</button>
                </div>
                <form onSubmit={handleEditAgent}>
                  <div className="agent-form-row">
                    <div className="agent-form-group">
                      <label>Full Name * (minimum 2 characters)</label>
                      <input
                        type="text"
                        value={editingAgent.name}
                        onChange={(e) => setEditingAgent({...editingAgent, name: e.target.value})}
                        placeholder="Enter full name (minimum 2 characters)"
                        required
                        minLength={2}
                      />
                      {editingAgent.name && editingAgent.name.trim().length < 2 && (
                        <small style={{color: 'red'}}>
                          Name must be at least 2 characters long
                        </small>
                      )}
                    </div>

                    <div className="agent-form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={editingAgent.email}
                        onChange={(e) => setEditingAgent({...editingAgent, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                      {editingAgent.email && !editingAgent.email.includes('@') && (
                        <small style={{color: 'red'}}>
                          Please enter a valid email address
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="agent-form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={editingAgent.role ? editingAgent.role.replace('_', ' ') : 'Unknown'}
                      disabled
                      className="role-display"
                    />
                    <small>Role cannot be changed from this interface</small>
                  </div>

                  <div className="agent-form-group">
                    <label>Status</label>
                    <select
                      value={editingAgent.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setEditingAgent({...editingAgent, is_active: e.target.value === 'active'})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="agent-form-actions">
                    <button type="submit" className="agent-save-btn">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="agent-cancel-btn"
                      onClick={() => setEditingAgent(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="agents-table" style={{ 
            marginTop: '15px', 
            paddingTop: '0',
            marginRight: '-20px',
            paddingRight: '0'
          }}>
            <table>
              <thead>
                <tr>
                  <th 
                    className="agents-header-cell sortable-header" 
                    onClick={() => handleAgentsSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    NAME
                    {agentsSortField === 'name' && (
                      <span className="sort-arrow">
                        {agentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="agents-header-cell sortable-header" 
                    onClick={() => handleAgentsSort('email')}
                    style={{ cursor: 'pointer' }}
                  >
                    EMAIL
                    {agentsSortField === 'email' && (
                      <span className="sort-arrow">
                        {agentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="agents-header-cell sortable-header" 
                    onClick={() => handleAgentsSort('role')}
                    style={{ cursor: 'pointer' }}
                  >
                    ROLE
                    {agentsSortField === 'role' && (
                      <span className="sort-arrow">
                        {agentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="agents-header-cell sortable-header" 
                    onClick={() => handleAgentsSort('is_active')}
                    style={{ cursor: 'pointer' }}
                  >
                    STATUS
                    {agentsSortField === 'is_active' && (
                      <span className="sort-arrow">
                        {agentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="agents-header-cell sortable-header" 
                    onClick={() => handleAgentsSort('last_login')}
                    style={{ cursor: 'pointer' }}
                  >
                    LAST LOGIN
                    {agentsSortField === 'last_login' && (
                      <span className="sort-arrow">
                        {agentsSortDirection === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sortAgents(agents, agentsSortField, agentsSortDirection).map(agent => (
                  <tr key={agent.id}>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ 
                        background: 'none', 
                        color: '#333', 
                        padding: '0', 
                        border: 'none', 
                        borderRadius: '0',
                        boxShadow: 'none',
                        fontWeight: 'normal'
                      }}>
                        {(agent.role || 'unknown').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${agent.is_active ? 'active' : 'inactive'}`} style={agent.is_active ? { backgroundColor: '#d4edda', color: '#155724' } : {}}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {agent.last_login ? 
                        new Date(agent.last_login).toLocaleDateString() 
                        : 'Never'
                      }
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            // All agents can now be edited directly
                            setEditingAgent(agent);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {agents.length === 0 && (
              <div className="no-agents">
                <p>👨‍💼 No agents found</p>
                <p>Click the "+" button to add your first agent</p>
              </div>
            )}
          </div>
            </div>
          </div>
        </>
      )}





      {/* Agent Delete Confirmation Modal */}
      {deleteAgentConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setDeleteAgentConfirm(null)}
              >
                ✕
              </button>
            </div>
            <div className="delete-confirm-content">
              <p>Are you sure you want to delete this agent?</p>
              <p className="agent-name">
                <strong>Name:</strong> {deleteAgentConfirm.name}
              </p>
              <p className="agent-email">
                <strong>Email:</strong> {deleteAgentConfirm.email}
              </p>
              <p className="agent-role">
                <strong>Role:</strong> {deleteAgentConfirm.role ? deleteAgentConfirm.role.replace('_', ' ') : 'Unknown'}
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="delete-confirm-btn"
                onClick={confirmDeleteAgent}
              >
                Delete
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setDeleteAgentConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success Notification */}
      {showSuccess && (
        <div className="success-notification">
          <div className="success-notification-content">
            <div className="success-icon">✓</div>
            <div className="success-message">{successMessage}</div>
            <button 
              className="success-close-btn"
              onClick={() => {
                setShowSuccess(false);
                setSuccessMessage('');
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Custom Error Notification */}
      {showError && (
        <div className="error-notification">
          <div className="error-notification-content">
            <div className="error-icon">✕</div>
            <div className="error-message">{errorMessage}</div>
            <button 
              className="error-close-btn"
              onClick={() => {
                setShowError(false);
                setErrorMessage('');
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default BusinessDashboard; 
