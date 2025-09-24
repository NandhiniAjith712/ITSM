import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalLogin.css';

const GlobalLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    login_id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔍 Global login attempt:', formData);
      
      // Validate form data
      if (!formData.login_id || !formData.password) {
        setError('Please enter both Login ID and Password');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/global-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Login successful, redirecting to dashboard...');
        
        // Store user data
        console.log('💾 Storing user data:', data.data.user);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        // Store JWT token
        if (data.data.token) {
          console.log('🔑 Storing JWT token');
          localStorage.setItem('userToken', data.data.token);
        }
        
        // Store session persistence data
        localStorage.setItem('is_logged_in', 'true');
        localStorage.setItem('login_timestamp', new Date().toISOString());
        localStorage.setItem('session_expires', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 days
        
        // Store credentials for auto-login (optional - user can choose)
        if (rememberMe) {
          localStorage.setItem('remembered_login_id', formData.login_id);
          localStorage.setItem('remembered_password', formData.password);
        }
        
        // Redirect based on dashboard type and role immediately
        const { dashboard_type, role } = data.data.user;
        
        console.log('🎯 Redirecting user with role:', role, 'dashboard_type:', dashboard_type);
        console.log('🔍 Full user data:', data.data.user);
        
        // Update App.js user state first
        if (onLogin) {
          console.log('🔄 Calling onLogin to update App.js state');
          onLogin(data.data.user);
        }
        
        // Force immediate navigation based on role - NO FALLBACKS
        if (role === 'support_executive' || role === 'admin') {
          console.log('🔄 FORCE REDIRECT: Agent to /agentdashboard');
          navigate('/agentdashboard', { replace: true });
        } else if (role === 'support_manager' || role === 'manager') {
          console.log('🔄 FORCE REDIRECT: Manager to /manager');
          navigate('/manager', { replace: true });
        } else if (role === 'ceo') {
          console.log('🔄 FORCE REDIRECT: CEO to /ceo');
          navigate('/ceo', { replace: true });
        } else {
          // Only regular users go to user dashboard
          console.log('🔄 FORCE REDIRECT: Regular user to /userdashboard');
          navigate('/userdashboard', { replace: true });
        }
        
      } else {
        console.error('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      
      if (err.message.includes('401')) {
        setError('Invalid Login ID or Password. Please check your credentials.');
      } else if (err.message.includes('fetch')) {
        setError('Network error. Please check if the server is running.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-login-container">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Left Content Area */}
      <div className="left-content">
        <div className="brand-section">
          <div className="logo">
            <div className="logo-icon">🎫</div>
            <span className="logo-text">ITSM Ticketing</span>
          </div>
          <h1 className="main-heading">Professional Ticket Management System</h1>
          <p className="description">
            Streamline your support operations with our comprehensive ITSM platform. 
            Manage tickets, track SLAs, and provide exceptional customer service with 
            our intuitive and powerful ticketing solution designed for modern businesses.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="login-panel">
        <div className="login-content">
          <div className="login-header">
            <h2>WELCOME TO ITSM SYSTEM</h2>
            <p>LOGIN TO ACCESS YOUR DASHBOARD</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">✉️</div>
              <input
                type="text"
                name="login_id"
                value={formData.login_id}
                onChange={handleChange}
                placeholder="Enter your login ID or email"
                className="form-input"
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">🔒</div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="remember-me-container">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="remember-me-checkbox"
                />
                <span className="remember-me-text">Remember me for 7 days</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign In to System'}</span>
              <span className="arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GlobalLogin;
