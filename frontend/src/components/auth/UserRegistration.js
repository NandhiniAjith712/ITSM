import React, { useState } from 'react';
import './UserRegistration.css';

const UserRegistration = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.log('🔍 User registration attempt:', formData);
      
      // Validate form data
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        setLoading(false);
        return;
      }

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          department: formData.department.trim() || null
        })
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Registration successful');
        if (onRegister) onRegister(data.data);
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: ''
        });
        alert('Registration successful! You can now login with your credentials.');
      } else {
        console.error('❌ Registration failed:', data.message);
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => `${error.path}: ${error.msg}`).join('\n');
          setError(`Validation failed:\n${errorMessages}`);
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-container">
      <div className="user-registration-card">
        <div className="user-registration-header">
          <h2>User Registration</h2>
          <p>Create your account to get started</p>
        </div>

        <form className="user-registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="form-input"
              minLength={2}
            />
            {formData.name && formData.name.trim().length < 2 && (
              <small style={{color: 'red'}}>Name must be at least 2 characters long</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              className="form-input"
            />
            {formData.email && !formData.email.includes('@') && (
              <small style={{color: 'red'}}>Please enter a valid email address</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="form-input"
              minLength={6}
            />
            {formData.password && formData.password.length < 6 && (
              <small style={{color: 'red'}}>Password must be at least 6 characters long</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className="form-input"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small style={{color: 'red'}}>Passwords do not match</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department (Optional)</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="user-registration-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
