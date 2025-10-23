import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AutoLoginPage.css';

const AutoLoginPage = ({ onLogin }) => {
  const { email, product, phone } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoLoginData, setAutoLoginData] = useState(null);

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        console.log('🔗 Auto-login initiated for:', { email, product, phone });
        
        // Set auto-login context immediately to prevent redirect loops
        const autoLoginContext = {
          email: email,
          name: email.split('@')[0], // Extract name from email
          product: product,
          phone: phone,
          timestamp: new Date().toISOString(),
          source: 'auto-login'
        };
        localStorage.setItem('autoLoginContext', JSON.stringify(autoLoginContext));
        
        // Call the auto-login API
        const response = await fetch(`http://localhost:5000/api/auth/auto-login/${encodeURIComponent(email)}/${encodeURIComponent(email.split('@')[0])}/${encodeURIComponent(product)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Get the response text (HTML)
        const responseText = await response.text();
        console.log('✅ Auto-login response received (HTML)');
        
        // Extract redirect URL from the HTML response
        const redirectMatch = responseText.match(/url=([^"]+)/);
        if (redirectMatch) {
          const redirectUrl = redirectMatch[1];
          console.log('🔗 Redirect URL found:', redirectUrl);
          
          // Parse the redirect URL to extract user data
          const url = new URL(redirectUrl);
          const userId = url.searchParams.get('user_id');
          const userName = url.searchParams.get('user_name');
          const userEmail = url.searchParams.get('user_email');
          const userRole = url.searchParams.get('user_role');
          const token = url.searchParams.get('token');
          
          console.log('📊 Extracted user data from redirect URL:');
          console.log('User ID:', userId);
          console.log('User Name:', userName);
          console.log('User Email:', userEmail);
          console.log('User Role:', userRole);
          
          // Create user data object
          const userData = {
            id: parseInt(userId),
            name: userName,
            email: userEmail,
            role: userRole
          };
          
          // Store user data
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('userToken', token);
          
          // Update auto-login context with the product
          const updatedContext = {
            ...autoLoginContext,
            userId: parseInt(userId),
            userName: userName,
            loginSuccess: true
          };
          localStorage.setItem('autoLoginContext', JSON.stringify(updatedContext));
          setAutoLoginData(updatedContext);
          
          console.log('🔗 Auto-login context stored:', updatedContext);
          
          // Call the onLogin callback
          if (onLogin) {
            onLogin(userData);
          }
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          throw new Error('Could not extract redirect URL from auto-login response');
        }
      } catch (err) {
        console.error('❌ Auto-login error:', err);
        setError(err.message || 'Auto-login failed. Please try again.');
        
        // Clear auto-login context on error
        localStorage.removeItem('autoLoginContext');
      } finally {
        setIsLoading(false);
      }
    };

    performAutoLogin();
  }, [email, product, phone, onLogin, navigate]);

  if (isLoading) {
    return (
      <div className="auto-login-container">
        <div className="auto-login-content">
          <div className="loading-spinner"></div>
          <h2>🔄 Auto-login in progress...</h2>
          <p>Please wait while we log you in automatically.</p>
          <div className="auto-login-details">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Product:</strong> {product}</p>
            <p><strong>Phone:</strong> {phone}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auto-login-container">
        <div className="auto-login-content">
          <h2><span className="cross-icon">✕</span> Auto-login failed</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
          <button 
            className="manual-login-button"
            onClick={() => navigate('/login')}
          >
            📝 Manual Login
          </button>
        </div>
      </div>
    );
  }

  if (autoLoginData) {
    return (
      <div className="auto-login-container">
        <div className="auto-login-content">
          <h2><span className="success-icon">✅</span> Auto-login successful!</h2>
          <p>Welcome back, {email}!</p>
          <div className="auto-login-details">
            <p><strong>Product:</strong> {product}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Login time:</strong> {new Date(autoLoginData.timestamp).toLocaleString()}</p>
          </div>
          <p className="redirect-message">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AutoLoginPage;
