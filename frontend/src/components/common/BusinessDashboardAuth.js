import React, { useState } from 'react';
import BusinessDashboard from '../dashboards/BusinessDashboard';
import './BusinessDashboardAuth.css';

const BusinessDashboardAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already authenticated from localStorage
    const authStatus = localStorage.getItem('businessDashboardAuth') === 'true';
    const authTime = localStorage.getItem('businessDashboardAuthTime');
    
    // Check if authentication is still valid (24 hours)
    if (authStatus && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Authentication expired, clear it
        localStorage.removeItem('businessDashboardAuth');
        localStorage.removeItem('businessDashboardAuthTime');
        return false;
      }
    }
    
    return authStatus;
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Hardcoded password: vdata1234
    if (password === 'vdata1234') {
      setIsAuthenticated(true);
      localStorage.setItem('businessDashboardAuth', 'true');
      localStorage.setItem('businessDashboardAuthTime', Date.now().toString());
      setError('');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <BusinessDashboard />
      </div>
    );
  }

  return (
    <div className="business-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 Business Dashboard Access</h1>
          <p>Enter password to access the business dashboard</p>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="password-input"
            />
          </div>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          <button type="submit" className="auth-submit-btn">
            🔓 Access Dashboard
          </button>
        </form>
        
        <div className="auth-footer">
          <p>This dashboard is protected and requires authentication</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardAuth;
