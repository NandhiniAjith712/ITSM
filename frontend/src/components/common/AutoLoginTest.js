import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AutoLoginTest.css';

const AutoLoginTest = () => {
  const [email, setEmail] = useState('ss@gmail.com');
  const [product, setProduct] = useState('GRC');
  const [phone, setPhone] = useState('1234567890');
  const navigate = useNavigate();

  const handleTestAutoLogin = () => {
    console.log('🧪 Testing auto-login with:', { email, product, phone });
    
    // Navigate to auto-login route
    navigate(`/auto-login/${encodeURIComponent(email)}/${encodeURIComponent(product)}/${encodeURIComponent(phone)}`);
  };

  const handleTestBusinessDashboard = () => {
    console.log('🧪 Testing business dashboard access');
    navigate('/businessdashboard');
  };

  const handleTestDirectDashboard = () => {
    console.log('🧪 Testing direct dashboard access');
    navigate('/dashboard');
  };

  const handleClearStorage = () => {
    console.log('🧹 Clearing all storage');
    localStorage.clear();
    window.location.reload();
  };

  const handleShowStorage = () => {
    console.log('📦 Current localStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value);
    }
  };

  return (
    <div className="auto-login-test">
      <h1>🧪 Auto-Login Test Page</h1>
      
      <div className="test-section">
        <h2>Test Auto-Login Flow</h2>
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        
        <div className="form-group">
          <label>Product:</label>
          <input 
            type="text" 
            value={product} 
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Enter product"
          />
        </div>
        
        <div className="form-group">
          <label>Phone:</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
          />
        </div>
        
        <button onClick={handleTestAutoLogin} className="test-btn">
          🚀 Test Auto-Login
        </button>
      </div>

      <div className="test-section">
        <h2>Test Other Routes</h2>
        <button onClick={handleTestBusinessDashboard} className="test-btn">
          🏢 Test Business Dashboard
        </button>
        
        <button onClick={handleTestDirectDashboard} className="test-btn">
          📊 Test Direct Dashboard
        </button>
      </div>

      <div className="test-section">
        <h2>Debug Tools</h2>
        <button onClick={handleShowStorage} className="debug-btn">
          📦 Show Storage Contents
        </button>
        
        <button onClick={handleClearStorage} className="debug-btn danger">
          🗑️ Clear All Storage
        </button>
      </div>

      <div className="info-section">
        <h3>📋 Test Instructions:</h3>
        <ol>
          <li>Click "Test Auto-Login" to test the auto-login flow</li>
          <li>Click "Test Business Dashboard" to test business dashboard access</li>
          <li>Click "Test Direct Dashboard" to test protected route access</li>
          <li>Use debug tools to inspect storage and clear data</li>
        </ol>
        
        <h3>🔍 Expected Behavior:</h3>
        <ul>
          <li>Auto-login should work without redirecting to login page</li>
          <li>Business dashboard should be accessible without authentication</li>
          <li>Protected routes should show loading during auto-login</li>
          <li>After successful auto-login, user should be redirected to dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoLoginTest;
