import React, { useState, useEffect } from 'react';
import './UserForm.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactSelect from 'react-select';
import ReactCountryFlag from 'react-country-flag';

const UserForm = ({ user, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: '',
    product: '',
    module: '',
    issueType: '',
    issueTypeOther: '',
    issueTitle: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [replies, setReplies] = useState([]);
  const [products, setProducts] = useState([]);
  const [modules, setModules] = useState([]);
  const [slaConfigurations, setSlaConfigurations] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedSLA, setSelectedSLA] = useState(null);
  const [autoLoginProduct, setAutoLoginProduct] = useState(null);
  const countryOptions = [
    { value: '+1', label: 'United States', code: 'US' },
    { value: '+91', label: 'India', code: 'IN' },
    { value: '+44', label: 'United Kingdom', code: 'GB' },
    { value: '+61', label: 'Australia', code: 'AU' },
    { value: '+81', label: 'Japan', code: 'JP' },
    { value: '+49', label: 'Germany', code: 'DE' },
    { value: '+971', label: 'United Arab Emirates', code: 'AE' },
    { value: '+880', label: 'Bangladesh', code: 'BD' },
    { value: '+234', label: 'Nigeria', code: 'NG' },
    { value: '+86', label: 'China', code: 'CN' },
    { value: '+7', label: 'Russia', code: 'RU' },
    { value: '+33', label: 'France', code: 'FR' },
    { value: '+39', label: 'Italy', code: 'IT' },
    { value: '+55', label: 'Brazil', code: 'BR' },
    { value: '+20', label: 'Egypt', code: 'EG' },
    { value: '+63', label: 'Philippines', code: 'PH' },
    { value: '+27', label: 'South Africa', code: 'ZA' },
    { value: '+82', label: 'South Korea', code: 'KR' },
    { value: '+34', label: 'Spain', code: 'ES' },
    { value: '+60', label: 'Malaysia', code: 'MY' },
    { value: '+65', label: 'Singapore', code: 'SG' },
    { value: '+966', label: 'Saudi Arabia', code: 'SA' },
    { value: '+972', label: 'Israel', code: 'IL' },
    { value: '+92', label: 'Pakistan', code: 'PK' },
    { value: '+212', label: 'Morocco', code: 'MA' },
    { value: '+351', label: 'Portugal', code: 'PT' },
    { value: '+380', label: 'Ukraine', code: 'UA' },
    { value: '+84', label: 'Vietnam', code: 'VN' },
    { value: '+852', label: 'Hong Kong', code: 'HK' },
    { value: '+886', label: 'Taiwan', code: 'TW' },
  ];
  const [countryCode, setCountryCode] = useState(countryOptions[0]);

  const issueTypes = [
    'Technical Support',
    'Billing Issue',
    'Account Access',
    'Product Inquiry',
    'Bug Report',
    'Feature Request',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 Form input change: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle product selection
    if (name === 'product') {
      console.log('🔄 Product selected:', value);
      
      // Reset dependent fields when product changes
      setFormData(prev => ({
        ...prev,
        module: '', // Reset module when product changes
        [name]: value
      }));
      setSelectedSLA(null); // Reset SLA timer
      setSlaConfigurations([]); // Reset SLA configurations
      
      if (value) {
        // Check if the selected product exists in the loaded products
        const selectedProduct = products.find(p => p.name === value);
        if (selectedProduct) {
          console.log('✅ Found selected product in products list:', selectedProduct);
          console.log('🔗 Product ID linked for module loading:', selectedProduct.id);
          console.log('🔄 Manual selection - Product name linked to ID:', selectedProduct.name, '→', selectedProduct.id);
          
          // Fetch modules using the correct product ID
          fetchModules(selectedProduct.id);
        } else {
          console.log('⚠️ Selected product not found in products list:', value);
          console.log('🔄 Attempting to fetch modules by product name as fallback');
          // Try to fetch modules using product name as fallback
          fetchModulesByName(value);
        }
      } else {
        setModules([]);
      }
    }

    // Handle module selection
    if (name === 'module') {
      if (value) {
        const selectedModule = modules.find(m => m.name === value);
        if (selectedModule) {
          console.log('✅ Module selected:', selectedModule.name);
          console.log('🔗 Module ID linked for SLA loading:', selectedModule.id);
          console.log('🔄 Manual selection - Module name linked to ID:', selectedModule.name, '→', selectedModule.id);
          
          fetchSLAConfigurations(selectedModule.id);
        }
      } else {
        setSlaConfigurations([]);
        setSelectedSLA(null);
      }
    }
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch('http://localhost:5000/api/sla/products');
      if (response.ok) {
        const result = await response.json();
        setProducts(result.data || []);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchModules = async (productId) => {
    try {
      setLoadingModules(true);
      console.log('🔄 Fetching modules for product ID:', productId);
      const response = await fetch(`http://localhost:5000/api/sla/products/${productId}/modules`);
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Modules fetched successfully:', result.data);
        setModules(result.data || []);
      } else {
        console.error('Failed to fetch modules');
        setModules([]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  // Fallback function to fetch modules by product name when product ID is not available
  const fetchModulesByName = async (productName) => {
    try {
      setLoadingModules(true);
      console.log('🔄 Fetching modules by product name:', productName);
      
      // Try to find the product by name first in the loaded products
      const product = products.find(p => p.name === productName);
      if (product) {
        console.log('✅ Found product by name in loaded products, fetching modules by ID:', product.id);
        console.log('🔗 Product ID linked successfully:', product.id);
        fetchModules(product.id);
        return;
      }
      
      console.log('⚠️ Product not found in loaded products, checking backend...');
      
      // If product not found in local products, try to fetch from backend by name
      // NOTE: This endpoint needs to be created in the backend: /api/sla/products/by-name/{productName}/modules
      const response = await fetch(`http://localhost:5000/api/sla/products/by-name/${encodeURIComponent(productName)}/modules`);
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Modules fetched by product name from backend:', result.data);
        setModules(result.data || []);
      } else {
        console.log('⚠️ No modules found for product name in backend:', productName);
        setModules([]);
      }
    } catch (error) {
      console.error('Error fetching modules by product name:', error);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchSLAConfigurations = async (moduleId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sla/modules/${moduleId}/configurations`);
      if (response.ok) {
        const result = await response.json();
        setSlaConfigurations(result.data || []);
      } else {
        console.error('Failed to fetch SLA configurations');
        setSlaConfigurations([]);
      }
    } catch (error) {
      console.error('Error fetching SLA configurations:', error);
      setSlaConfigurations([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update SLA timer when configurations change
  useEffect(() => {
    if (slaConfigurations.length > 0) {
      // Find the default SLA configuration (usually P2 or the first one)
      const defaultSLA = slaConfigurations.find(config => config.priority_level === 'P2') || slaConfigurations[0];
      if (defaultSLA) {
        const responseTime = Math.floor(defaultSLA.response_time_minutes / 60);
        const responseMinutes = defaultSLA.response_time_minutes % 60;
        const resolutionTime = Math.floor(defaultSLA.resolution_time_minutes / 60);
        const resolutionMinutes = defaultSLA.resolution_time_minutes % 60;
        
        setSelectedSLA(
          `Response: ${responseTime}h ${responseMinutes}m | Resolution: ${resolutionTime}h ${resolutionMinutes}m (${defaultSLA.priority_level})`
        );
      }
    } else {
      setSelectedSLA(null);
    }
  }, [slaConfigurations]);

  // Check for auto-login context and pre-fill form
  useEffect(() => {
    const autoLoginContext = localStorage.getItem('autoLoginContext');
    if (autoLoginContext) {
      try {
        const context = JSON.parse(autoLoginContext);
        console.log('🔗 Auto-login context found:', context);
        
        // Store auto-login product for later use
        if (context.product) {
          setAutoLoginProduct(context.product);
          console.log('🎯 Auto-login product stored:', context.product);
        }
        
        // Pre-fill form with auto-login data
        setFormData(prev => ({
          ...prev,
          name: context.name || context.email?.split('@')[0] || prev.name,
          email: context.email || prev.email,
          product: context.product || prev.product
        }));
        
        console.log('🎯 Set initial form data with product:', context.product);
        
        // Force immediate product selection if products are already loaded
        if (products.length > 0 && context.product) {
          console.log('🔄 Products already loaded, checking for immediate product selection');
          const productExists = products.find(p => p.name === context.product);
          if (productExists) {
            console.log('✅ Immediate product selection - found in loaded products:', context.product);
            setFormData(prev => ({
              ...prev,
              product: productExists.name
            }));
            fetchModules(productExists.id);
          }
        }
        
        // If phone is available, set it with proper country code detection
        if (context.phone) {
          console.log('📱 Processing phone number:', context.phone);
          
          // Handle phone number with or without country code
          let phoneNumber = context.phone;
          let countryCode = '+1'; // Default to US
          
          // If phone starts with +, extract country code
          if (context.phone.startsWith('+')) {
            // Find matching country code
            for (const option of countryOptions) {
              if (context.phone.startsWith(option.value)) {
                countryCode = option.value;
                phoneNumber = context.phone.substring(option.value.length);
                break;
              }
            }
          } else {
            // If no country code, assume it's a 10-digit US number
            if (context.phone.length === 10) {
              countryCode = '+1';
              phoneNumber = context.phone;
            }
          }
          
          // Set country code
          const foundCountry = countryOptions.find(option => option.value === countryCode);
          if (foundCountry) {
            setCountryCode(foundCountry);
            console.log('🌍 Set country code to:', foundCountry.label, foundCountry.value);
          }
          
          // Set phone number (without country code)
          setFormData(prev => ({
            ...prev,
            mobile: phoneNumber
          }));
          
          console.log('📱 Set phone number:', phoneNumber, 'with country code:', countryCode);
        }
        
        // DON'T clear the auto-login context yet - wait for products to load
        console.log('✅ Form pre-filled with auto-login data (context preserved)');
        
      } catch (error) {
        console.error('❌ Error parsing auto-login context:', error);
        localStorage.removeItem('autoLoginContext');
      }
    }
  }, []); // Remove products dependency to avoid infinite loops

    // Separate useEffect to handle product selection after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      console.log('🔄 Products loaded, checking for auto-login product');
      console.log('📋 Available products:', products.map(p => `${p.name} (ID: ${p.id})`));
      
      // Check if we have auto-login product to set
      if (autoLoginProduct) {
        console.log('🎯 Auto-login product to set:', autoLoginProduct);
        
        // Check if the auto-login product exists in the loaded products
        const productExists = products.find(p => p.name === autoLoginProduct);
        if (productExists) {
          console.log('✅ Auto-login product found in products:', autoLoginProduct);
          console.log('🔗 Product ID linked:', productExists.id);
          
          // Set the product in form data
          console.log('🔄 Setting auto-login product in form:', productExists.name);
          setFormData(prev => ({
            ...prev,
            product: productExists.name
          }));
          
          // Force a re-render to ensure the dropdown updates
          setTimeout(() => {
            console.log('🔄 Force re-render for product dropdown');
            setFormData(prev => ({ ...prev }));
          }, 100);
          
          // Fetch modules for the selected product using the correct ID
          console.log('🔄 Fetching modules for product ID:', productExists.id);
          fetchModules(productExists.id);
          
          // Clear the auto-login product and context after successful product selection
          setTimeout(() => {
            setAutoLoginProduct(null);
            localStorage.removeItem('autoLoginContext');
            console.log('✅ Auto-login product and context cleared after product selection');
          }, 2000); // Delay clearing to ensure form is updated
        } else {
          console.log('⚠️ Auto-login product not found in products list:', autoLoginProduct);
          console.log('🔍 Available product names:', products.map(p => p.name));
          
          // Try to fetch modules using product name as fallback
          console.log('🔄 Attempting to fetch modules for auto-login product:', autoLoginProduct);
          fetchModulesByName(autoLoginProduct);
          
          // Clear the auto-login product and context even if product not found
          setTimeout(() => {
            setAutoLoginProduct(null);
            localStorage.removeItem('autoLoginContext');
            console.log('✅ Auto-login product and context cleared (product not found)');
          }, 2000);
        }
      } else {
        // Check if formData.product is set but autoLoginProduct is not
        if (formData.product && !autoLoginProduct) {
          console.log('🔄 Form has product but no auto-login product:', formData.product);
          
          const productExists = products.find(p => p.name === formData.product);
          if (productExists) {
            console.log('✅ Product found in products:', formData.product);
            console.log('🔗 Product ID linked:', productExists.id);
            
            // Fetch modules for the selected product using the correct ID
            console.log('🔄 Fetching modules for product ID:', productExists.id);
            fetchModules(productExists.id);
          } else {
            console.log('⚠️ Product not found in products list:', formData.product);
            console.log('🔄 Attempting to fetch modules for product:', formData.product);
            fetchModulesByName(formData.product);
            setModules([]);
          }
        }
      }
    }
  }, [products, autoLoginProduct]); // Watch both products and autoLoginProduct

  // Debug useEffect to log form data changes
  useEffect(() => {
    console.log('📊 Form data updated:', formData);
    console.log('🎯 Product field value:', formData.product);
    console.log('📋 Products loaded:', products.length);
    console.log('🔍 Auto-login context exists:', !!localStorage.getItem('autoLoginContext'));
    console.log('🎯 Auto-login product state:', autoLoginProduct);
  }, [formData, products, autoLoginProduct]);

  // Helper function to create auto-login URL
  const createAutoLoginUrl = (email, product, phone) => {
    return `${window.location.origin}/auto-login/${encodeURIComponent(email)}/${encodeURIComponent(product)}/${encodeURIComponent(phone)}`;
  };

  // Check for URL parameters as fallback (auto-login context is handled in the product loading useEffect)
  useEffect(() => {
    // Only check URL parameters if no auto-login context exists
    const autoLoginContext = localStorage.getItem('autoLoginContext');
    if (autoLoginContext) {
      console.log('🔗 Auto-login context exists, skipping URL parameter check');
      return;
    }
    
    // Fallback: Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const productParam = urlParams.get('product');
    const phoneParam = urlParams.get('phone');
    
    if (emailParam || productParam || phoneParam) {
      console.log('🔗 URL parameters found for auto-fill:', { emailParam, productParam, phoneParam });
      
      // Pre-fill form with URL parameters
      setFormData(prev => ({
        ...prev,
        name: emailParam?.split('@')[0] || prev.name,
        email: emailParam || prev.email,
        product: productParam || prev.product
      }));
      
      // Handle phone number from URL
      if (phoneParam) {
        console.log('📱 Processing phone number from URL:', phoneParam);
        
        let phoneNumber = phoneParam;
        let countryCode = '+1'; // Default to US
        
        // If phone starts with +, extract country code
        if (phoneParam.startsWith('+')) {
          // Find matching country code
          for (const option of countryOptions) {
            if (phoneParam.startsWith(option.value)) {
              countryCode = option.value;
              phoneNumber = phoneParam.substring(option.value.length);
              break;
            }
          }
        } else {
          // If no country code, assume it's a 10-digit US number
          if (phoneParam.length === 10) {
            countryCode = '+1';
            phoneNumber = phoneParam;
          }
        }
        
        // Set country code
        const foundCountry = countryOptions.find(option => option.value === countryCode);
        if (foundCountry) {
          setCountryCode(foundCountry);
          console.log('🌍 Set country code to:', foundCountry.label, foundCountry.value);
        }
        
        // Set phone number (without country code)
        setFormData(prev => ({
          ...prev,
          mobile: phoneNumber
        }));
        
        console.log('📱 Set phone number from URL:', phoneNumber, 'with country code:', countryCode);
      }
    }
  }, []); // Remove products dependency to avoid infinite loops

  const fetchReplies = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/replies/${id}`);
      if (response.ok) {
        const result = await response.json();
        setReplies(result.data);
      } else {
        setReplies([]);
      }
    } catch (error) {
      setReplies([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile ? (countryCode.value + formData.mobile) : '');
      formDataToSend.append('product', formData.product);
      formDataToSend.append('module', formData.module);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('issueType', formData.issueType);
      if (formData.issueType === 'Other') {
        formDataToSend.append('issueTypeOther', formData.issueTypeOther);
      }
      formDataToSend.append('issueTitle', formData.issueTitle);
      if (user && user.id) {
        formDataToSend.append('userId', user.id);
      }
      
      // Add attachment if selected
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        
        // Preserve auto-login data for future submissions
        const autoLoginContext = localStorage.getItem('autoLoginContext');
        let preservedEmail = '';
        let preservedProduct = '';
        
        if (autoLoginContext) {
          try {
            const context = JSON.parse(autoLoginContext);
            preservedEmail = context.email || '';
            preservedProduct = context.product || '';
          } catch (error) {
            console.error('Error parsing auto-login context:', error);
          }
        }
        
        setFormData({
          name: '',
          email: preservedEmail, // Preserve email from auto-login
          mobile: '',
          product: preservedProduct, // Preserve product from auto-login
          module: '',
          issueType: '',
          issueTypeOther: '',
          issueTitle: '',
          description: ''
        });
        setAttachment(null);
        setTicketId(result.data.id);
        // Fetch real replies for this ticket
        fetchReplies(result.data.id);
        // If user is logged in and name was missing, update it in backend
        if (user && user.id && !user.name && formData.name) {
          try {
            const userUpdateResponse = await fetch(`http://localhost:5000/api/users/${user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: formData.name })
            });
            
            if (userUpdateResponse.ok) {
              // Update localStorage and user object
              const updatedUser = { ...user, name: formData.name };
              localStorage.setItem('tickUser', JSON.stringify(updatedUser));
            } else {
              console.warn('Failed to update user name in backend, but ticket was created successfully');
            }
          } catch (error) {
            console.warn('Error updating user name:', error);
            // Don't fail the entire submission if user update fails
          }
        }
        if (onSubmit) onSubmit();
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        
        // Show specific error messages
        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map(err => `${err.path}: ${err.msg}`).join('\n');
          alert('Please fix the following errors:\n' + errorMessages);
        } else if (errorData.message) {
          alert(`Error: ${errorData.message}`);
        } else {
          alert('Failed to submit ticket. Please try again.');
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form-container">
      <div className="form-card">
        <div className="form-header">
          <button 
            className="close-button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '40px',
              cursor: 'pointer',
              color: '#6b7280',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
            }}
          >
            ×
          </button>
          <h1>Submit Your Query</h1>
          <p>We're here to help! Please fill out the form below.</p>
          
                     {/* Enhanced Auto-Login Status Display */}
           <div className="auto-login-status" style={{ 
             background: '#f8f9fa',
             borderRadius: '12px',
             padding: '20px',
             marginTop: '15px',
             color: '#000000',
             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
             border: '1px solid #e9ecef'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               {/* Left side - User info */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingTop: '2px' }}>
                   <div style={{ 
                     width: '30px', 
                     height: '30px', 
                     background: 'white', 
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#6c757d',
                     fontSize: '14px',
                     border: '1px solid #dee2e6',
                     lineHeight: '1',
                     flexShrink: 0,
                     marginTop: '3px'
                   }}>👤</div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                     <div style={{ fontWeight: '600', fontSize: '14px', color: '#495057', marginBottom: '2px', alignSelf: 'flex-start' }}>Username</div>
                     <div style={{ fontSize: '14px', color: '#6c757d', alignSelf: 'flex-start' }}>{formData.name || 'Not set'}</div>
                   </div>
                 </div>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <div style={{ 
                     width: '30px', 
                     height: '30px', 
                     background: 'white', 
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#6c757d',
                     fontSize: '14px',
                     border: '1px solid #dee2e6',
                     lineHeight: '1',
                     flexShrink: 0,
                     marginTop: '-12px'
                   }}>📧</div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                     <div style={{ fontWeight: '600', fontSize: '14px', color: '#495057', marginBottom: '2px', alignSelf: 'flex-start' }}>Email</div>
                     <div style={{ fontSize: '14px', color: '#6c757d', alignSelf: 'flex-start' }}>{formData.email || 'Not set'}</div>
                   </div>
                 </div>
               </div>

               {/* Right side - Quick Test */}
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontWeight: '600', fontSize: '16px', color: '#495057', marginBottom: '12px' }}>Quick Test</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <a 
                     href={createAutoLoginUrl('test@example.com', 'ProjectX', '1234567890')}
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ 
                       color: '#007bff', 
                       textDecoration: 'none',
                       background: '#e3f2fd',
                       padding: '8px 16px',
                       borderRadius: '6px',
                       fontSize: '14px',
                       display: 'inline-block',
                       border: '1px solid #bbdefb',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = '#bbdefb';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = '#e3f2fd';
                     }}
                   >
                     Test ProjectX
                   </a>
                   <a 
                     href={createAutoLoginUrl('test@example.com', 'GRC', '9876543210')}
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{ 
                       color: '#007bff', 
                       textDecoration: 'none',
                       background: '#e3f2fd',
                       padding: '8px 16px',
                       borderRadius: '6px',
                       fontSize: '14px',
                       display: 'inline-block',
                       border: '1px solid #bbdefb',
                       transition: 'all 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = '#bbdefb';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = '#e3f2fd';
                     }}
                   >
                     Test GRC
                   </a>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {submitStatus === 'success' && (
          <div className="success-message">
            <h3>✅ Query Submitted Successfully!</h3>
            <p>Thank you for contacting us. We'll review your query and get back to you soon.</p>
            <button onClick={() => { setSubmitStatus(null); setTicketId(null); setReplies([]); }}>Submit Another Query</button>
          </div>
        )}

        {submitStatus === 'success' && replies.length > 0 && (
          <div className="agent-replies-section">
            <h3>Agent Replies</h3>
            <ul className="agent-replies-list">
              {replies.map(reply => (
                <li key={reply.id} className="agent-reply-item">
                  <div className="agent-reply-header">
                    <span className="agent-reply-agent">{reply.agent_name}</span>
                    <span className="agent-reply-date">{new Date(reply.sent_at).toLocaleString()}</span>
                  </div>
                  <div className="agent-reply-message">{reply.message}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-message">
            <h3>❌ Something went wrong</h3>
            <p>Please try again or contact support if the problem persists.</p>
            <button onClick={() => setSubmitStatus(null)}>Try Again</button>
          </div>
        )}

        {!submitStatus && (
          <form onSubmit={handleSubmit} className="user-form">
            {/* First row: Name, Email */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={30}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Second row: Mobile, Product */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ReactSelect
                    options={countryOptions.map(opt => ({
                      value: opt.value,
                      label: (
                        <span style={{ fontSize: '0.8rem' }}>
                          <ReactCountryFlag countryCode={opt.code} svg style={{ width: '1em', height: '1em', marginRight: 6 }} />
                          {opt.label} {opt.value}
                        </span>
                      ),
                      code: opt.code,
                      countryName: opt.label // for filtering
                    }))}
                    value={{
                      value: countryCode.value,
                      label: (
                        <span style={{ fontSize: '0.8rem' }}>
                          <ReactCountryFlag countryCode={countryCode.code} svg style={{ width: '1em', height: '1em', marginRight: 6 }} />
                          {countryCode.label} {countryCode.value}
                        </span>
                      )
                    }}
                    onChange={selected => setCountryCode(countryOptions.find(opt => opt.value === selected.value))}
                    styles={{
                      control: (base) => ({ ...base, borderRadius: 6, borderColor: '#e0e7ef', minWidth: 80, width: '140px' }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                      input: (base) => ({ ...base, color: 'inherit', caretColor: 'auto', width: 'auto' }),
                      placeholder: (base) => ({ ...base, display: 'none' }),
                    }}
                    isSearchable={true}
                    placeholder=""
                    noOptionsMessage={() => "No countries found"}
                    filterOption={(option, inputValue) =>
                      option.data.countryName.toLowerCase().includes(inputValue.toLowerCase())
                    }
                  />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={15 - countryCode.value.length}
                    placeholder="Enter mobile number"
                    style={{ flex: 1, borderRadius: '6px', border: '2px solid #e0e7ef', padding: '6px 10px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="product">Select Product *</label>
                <select
                  key={`product-${formData.product}-${products.length}`}
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                  disabled={loadingProducts}
                >
                  <option value="">{loadingProducts ? 'Loading products...' : 'Select a product'}</option>
                  {products.map(product => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                  {/* Add auto-login product if it's not in the products list */}
                  {formData.product && !products.find(p => p.name === formData.product) && (
                    <option value={formData.product} disabled>
                      {formData.product}
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Third row: Module, Issue Type */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="module">Select Module *</label>
                <select
                  id="module"
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                  disabled={loadingModules}
                >
                  <option value="">{loadingModules ? 'Loading modules...' : 'Select a module'}</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.name}>
                      {module.name}
                    </option>
                  ))}
                </select>
                 {/* Module loading status */}
                 {loadingModules && (
                   <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}>
                     🔄 Loading modules for "{formData.product}"...
                   </div>
                 )}
                 {!loadingModules && formData.product && modules.length === 0 && (
                   <div style={{ fontSize: '12px', color: '#ffc107', marginTop: '4px' }}>
                     ⚠️ No modules found for "{formData.product}"
                   </div>
                 )}
                 {!loadingModules && formData.product && modules.length > 0 && (
                   <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>
                     ✅ {modules.length} module(s) loaded for "{formData.product}"
                   </div>
                 )}
                 {/* Module ID Linking Status */}
                 {formData.module && modules.length > 0 && (
                   <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}>
                     🔗 Module ID Link: {modules.find(m => m.name === formData.module) 
                       ? `"${formData.module}" ↔ ID: ${modules.find(m => m.name === formData.module)?.id}` 
                       : 'No module ID link found'}
                   </div>
                 )}
              </div>
              <div className="form-group">
                <label htmlFor="issueType">Select Issue Type *</label>
                <select
                  id="issueType"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleInputChange}
                  required
                  className="issue-select"
                >
                  <option value="">Select an issue type</option>
                  {issueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formData.issueType === 'Other' && (
                  <input
                    type="text"
                    name="issueTypeOther"
                    value={formData.issueTypeOther}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Please specify your issue"
                    style={{ marginTop: '8px', width: '100%' }}
                    required
                  />
                )}
              </div>
            </div>

            {/* Fourth row: Issue Title, SLA Timer */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issueTitle">Issue Title *</label>
                <input
                  type="text"
                  id="issueTitle"
                  name="issueTitle"
                  value={formData.issueTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief title for your issue"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sla">SLA Timer</label>
                <input
                  type="text"
                  id="sla"
                  name="sla"
                  value={selectedSLA || ''}
                  readOnly
                  placeholder="SLA Time"
                  style={{ borderRadius: '6px', border: '2px solid #e0e7ef', padding: '6px 10px', width: '100%' }}
                />
              </div>
            </div>

            {/* Fifth row: Attachment */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="attachment">Attachment (Image or PDF)</label>
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                {attachment && (
                  <span className="file-info">Selected: {attachment.name}</span>
                )}
              </div>
            </div>

            {/* Description field - separate at bottom */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Please describe your issue in detail..."
                rows="5"
              />
            </div>

            <div className="button-container">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Query'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  // Toggle the form (same as New Ticket button functionality)
                  window.parent.postMessage({ action: 'toggleForm' }, '*');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default UserForm; 