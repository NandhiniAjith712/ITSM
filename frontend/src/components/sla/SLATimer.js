import React, { useState, useEffect } from 'react';
import './SLATimer.css';

const SLATimer = ({ ticketId, onTimerUpdate }) => {
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Test API connection
  const testAuth = async () => {
    try {
      console.log('🔍 Testing SLA API connection...');
      
      const response = await fetch(`${API_BASE}/sla/test-auth`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 API test response status:', response.status);
      const data = await response.json();
      console.log('🔍 API test response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ SLA API connection successful');
        return true;
      } else {
        console.log('❌ SLA API connection failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ API test error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (ticketId) {
      console.log('🔄 SLATimer mounted for ticket:', ticketId);
      // Test API connection first
      testAuth().then(apiWorking => {
        if (apiWorking) {
          fetchTimers();
        } else {
          setError('SLA API connection failed. Please check server.');
          console.log('❌ Setting API error for ticket:', ticketId);
        }
      });
    }
  }, [ticketId]);

  useEffect(() => {
    let interval;
    if (autoRefresh && ticketId) {
      interval = setInterval(fetchTimers, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, ticketId]);

  const fetchTimers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching timers for ticket:', ticketId);
      
      const response = await fetch(`${API_BASE}/sla/timers/${ticketId}/remaining`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Timer response status:', response.status);
      
      const data = await response.json();
      console.log('🔍 Timer response data:', data);
      
      if (data.success) {
        setTimers(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch SLA timers');
      }
    } catch (error) {
      console.error('❌ Error fetching timers:', error);
      setError('Failed to fetch SLA timers');
    } finally {
      setLoading(false);
    }
  };



  const formatTimeRemaining = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const getTimerStatusColor = (timer) => {
    if (timer.is_breached) return '#ff4444';
    if (timer.is_warning) return '#ff8800';
    return '#44aa44';
  };

  const getTimerStatusClass = (timer) => {
    if (timer.is_breached) return 'breached';
    if (timer.is_warning) return 'warning';
    return 'normal';
  };



  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0': return '#ff4444';
      case 'P1': return '#ff8800';
      case 'P2': return '#ffaa00';
      case 'P3': return '#44aa44';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <div className="sla-timer-container">
        <div className="loading">Loading SLA timers...</div>
      </div>
    );
  }

  if (error && timers.length === 0) {
    return (
      <div className="sla-timer-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (timers.length === 0) {
    return (
      <div className="sla-timer-container">
        <div className="no-timers">No active SLA timers for this ticket</div>
      </div>
    );
  }

  return (
    <div className="sla-timer-container">
      <div className="timer-header">
        <h3>⏱️ SLA Timers</h3>
        <div className="timer-controls">
          <button 
            onClick={fetchTimers}
            className="refresh-btn"
            title="Refresh timers"
          >
            🔄
          </button>
          <label className="auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="timers-grid">
        {timers.map((timer, index) => (
          <div 
            key={`timer-${ticketId}-${index}`} 
            className={`timer-card ${getTimerStatusClass(timer)}`}
            style={{ borderColor: getTimerStatusColor(timer) }}
          >
            <div className="timer-header">
              <div className="timer-type">
                ⏱️ SLA Timer
              </div>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(timer.priority_level) }}
              >
                {timer.priority_level}
              </span>
            </div>

            <div className="timer-info">
              <div className="product-info">
                {timer.product_name}
              </div>
            </div>

            <div className="time-remaining">
              <div className="time-display">
                {timer.is_breached ? (
                  <span className="breached-time">
                    ⚠️ Breached by {formatTimeRemaining(Math.abs(timer.remaining_minutes))}
                  </span>
                ) : (
                  <span className="remaining-time">
                    ⏰ {formatTimeRemaining(timer.remaining_minutes)} remaining
                  </span>
                )}
              </div>
              
              <div className="time-details">
                <div>Deadline: {new Date(timer.deadline).toLocaleString()}</div>
                <div>SLA Time: {formatTimeRemaining(timer.sla_time_minutes)}</div>
              </div>
            </div>

            <div className="timer-actions">
              {timer.is_breached && (
                <div className="timer-status breached">
                  🚨 Automatically Escalated
                </div>
              )}
              {timer.auto_escalated && (
                <div className="timer-status auto-escalated">
                  🔄 Status Changed to Escalated
                </div>
              )}
              {!timer.is_breached && (
                <div className="timer-status">
                  ⏰ Active Timer
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SLATimer; 