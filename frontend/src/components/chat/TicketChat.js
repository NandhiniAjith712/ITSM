import React, { useState, useEffect, useRef } from 'react';
import './TicketChat.css';

const TicketChat = ({ ticket, onClose, onReplyAdded, user = null, userType = 'agent', awsStyle = false, showChatButton = true }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [agentName, setAgentName] = useState('Agent Smith'); // Default agent name
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showChat, setShowChat] = useState(!showChatButton);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';

  useEffect(() => {
    if (ticket && (showChat || !showChatButton)) {
      fetchMessages();
      connectWebSocket();
    }

    return () => {
      cleanup();
    };
  }, [ticket, showChat, showChatButton]);

  // Handle showChatButton prop changes
  useEffect(() => {
    setShowChat(!showChatButton);
  }, [showChatButton]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to check if WebSocket is ready to send
  const isWebSocketReady = () => {
    return wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
  };

  const connectWebSocket = () => {
    try {
      console.log('🔌 Attempting WebSocket connection...');
      setError(null);
      
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        
        // Wait a moment to ensure connection is fully established
        setTimeout(() => {
          if (isWebSocketReady()) {
            // Join the ticket room
            try {
              wsRef.current.send(JSON.stringify({
                type: 'JOIN_TICKET',
                ticketId: ticket.id,
                userId: user?.id || null,
                userType: userType
              }));
            } catch (error) {
              console.warn('⚠️ Failed to join ticket room:', error);
            }
          }
        }, 100);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        if (event.code !== 1000) { // Not a normal closure
          setError('Connection lost. Attempting to reconnect...');
          attemptReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setError('Connection error. Trying to reconnect...');
      };
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      setError('Failed to connect to chat server. Using fallback mode.');
      setIsConnected(false);
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff
      
      console.log(`🔄 Attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts} in ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connectWebSocket();
      }, delay);
    } else {
      setError('Connection failed after multiple attempts. Using fallback mode.');
      setIsConnected(false);
    }
  };

  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket message received:', data.type);
    
    switch (data.type) {
      case 'JOINED_ROOM':
        console.log('✅ Joined chat room:', data.message);
        setError(null);
        break;
        
      case 'NEW_MESSAGE':
        setMessages(prev => [...prev, {
          id: data.messageId || Date.now(),
          message: data.message,
          userType: data.userType,
          agentName: data.agentName,
          customerName: data.customerName,
          timestamp: data.timestamp,
          isNew: true
        }]);
        
        // Remove "new" flag after a moment
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => ({ ...msg, isNew: false }))
          );
        }, 3000);
        break;
        
      case 'USER_TYPING':
        if (data.userType !== userType) {
          setTypingUsers(prev => {
            const userKey = data.userType === 'agent' ? data.agentName : data.customerName;
            if (!prev.includes(userKey)) {
              return [...prev, userKey];
            }
            return prev;
          });
        }
        break;
        
      case 'USER_STOPPED_TYPING':
        if (data.userType !== userType) {
          setTypingUsers(prev => prev.filter(user => user !== (data.userType === 'agent' ? data.agentName : data.customerName)));
        }
        break;

      case 'ERROR':
        console.error('❌ WebSocket error:', data.message);
        setError(data.message);
        break;
        
      default:
        console.log('📨 Unknown message type:', data.type);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/chat/messages/${ticket.id}`);
      const data = await response.json();
      
      if (data.success) {
        const formattedMessages = data.data.map(msg => ({
          id: msg.id,
          message: msg.message,
          userType: msg.sender_type,
          agentName: msg.sender_type === 'agent' ? msg.sender_name : null,
          customerName: msg.sender_type === 'customer' ? msg.sender_name : null,
          timestamp: msg.created_at,
          isNew: false
        }));
        
        setMessages(formattedMessages);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    try {
      setSending(true);
      setError(null);
      
      if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send via WebSocket for real-time
        try {
          wsRef.current.send(JSON.stringify({
            type: 'SEND_MESSAGE',
            ticketId: ticket.id,
            message: messageText,
            userType: userType,
            agentName: userType === 'agent' ? agentName : null,
            customerName: userType === 'customer' ? (user?.name || user?.email) : null
          }));
        } catch (error) {
          console.warn('⚠️ WebSocket send failed, falling back to REST API:', error);
          // Fall through to REST API
          throw new Error('WebSocket send failed');
        }
      } else {
        // Fallback to REST API
        const response = await fetch(`${API_BASE}/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ticketId: ticket.id,
            senderType: userType,
            senderId: user?.id || null,
            senderName: userType === 'agent' ? agentName : (user?.name || user?.email),
            message: messageText
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to send message');
        }
        
        // Add message to local state
        setMessages(prev => [...prev, {
          id: data.data.id,
          message: data.data.message,
          userType: data.data.sender_type,
          agentName: data.data.sender_type === 'agent' ? data.data.sender_name : null,
          customerName: data.data.sender_type === 'customer' ? data.data.sender_name : null,
          timestamp: data.data.created_at,
          isNew: false
        }]);
      }
      
      if (onReplyAdded) {
        onReplyAdded();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      // Restore the message if sending failed
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Only send typing indicators if WebSocket is fully connected
    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (!typingTimeoutRef.current) {
        try {
          wsRef.current.send(JSON.stringify({
            type: 'TYPING',
            ticketId: ticket.id,
            userType: userType,
            agentName: userType === 'agent' ? agentName : null,
            customerName: userType === 'customer' ? (user?.name || user?.email) : null
          }));
        } catch (error) {
          console.warn('⚠️ Failed to send typing indicator:', error);
        }
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({
              type: 'STOP_TYPING',
              ticketId: ticket.id,
              userType: userType
            }));
          } catch (error) {
            console.warn('⚠️ Failed to send stop typing indicator:', error);
          }
        }
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };

  const handleRetry = () => {
    setError(null);
    setReconnectAttempts(0);
    cleanup();
    fetchMessages();
    connectWebSocket();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'escalated': return 'Escalated';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const openChat = () => {
    setShowChat(true);
  };

  const closeChat = () => {
    setShowChat(false);
    cleanup();
    if (onClose) {
      onClose();
    }
  };

  if (!ticket) return null;
  
  return (
    <>
      {/* Chat Icon Button */}
      {showChatButton && (
        <button 
          className="chat-icon-btn"
          onClick={openChat}
          title="Open Chat"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {(showChat || !showChatButton) && (
        <div className={`${showChatButton ? 'ticket-chat-overlay' : 'ticket-chat-inline'}`}>
          <div className="ticket-chat-container">
            {/* Connection Status */}
            <div className="chat-status-bar">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
              {wsRef.current && (
                <span className="ws-state">
                  State: {wsRef.current.readyState === WebSocket.CONNECTING ? '🔄 Connecting' : 
                         wsRef.current.readyState === WebSocket.OPEN ? '✅ Open' : 
                         wsRef.current.readyState === WebSocket.CLOSING ? '🔄 Closing' : '❌ Closed'}
                </span>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="chat-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{error}</span>
                <button 
                  className="retry-btn"
                  onClick={handleRetry}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="chat-messages">
              {loading ? (
                <div className="loading-messages">
                  <div className="loading-spinner"></div>
                  <p>Loading conversation...</p>
                </div>
              ) : (
                <>
                  {/* Original Ticket Message */}
                  <div className={`message customer-message ${awsStyle ? 'aws-style' : ''}`}>
                    {awsStyle ? (
                      // AWS Style Layout - Two Columns
                      <>
                        {/* Left Column - Chatter Info */}
                        <div className="aws-chatter-info">
                          <div className="chatter-name">{ticket.name}</div>
                          <div className="message-date">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="message-time">
                            {new Date(ticket.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </div>
                        </div>
                        
                        {/* Right Column - Message Content */}
                        <div className="aws-message-content">
                          <div className="message-text">
                            <strong>Issue:</strong> {ticket.issue_title}
                          </div>
                          <div className="message-text">
                            <strong>Type:</strong> {ticket.issue_type === 'Other' && ticket.issue_type_other 
                              ? ticket.issue_type_other 
                              : ticket.issue_type}
                          </div>
                          <div className="message-text">
                            <strong>Description:</strong> {ticket.description}
                          </div>
                          {ticket.product && (
                            <div className="message-text">
                              <strong>Product:</strong> {ticket.product}
                            </div>
                          )}
                          {ticket.module && (
                            <div className="message-text">
                              <strong>Module:</strong> {ticket.module}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Original Layout
                      <>
                        <div className="message-header">
                          <span className="sender-name">{ticket.name}</span>
                          <span className="message-time">
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                        <div className="message-content">
                          <div className="message-text">
                            <strong>Issue:</strong> {ticket.issue_title}
                          </div>
                          <div className="message-text">
                            <strong>Type:</strong> {ticket.issue_type === 'Other' && ticket.issue_type_other 
                              ? ticket.issue_type_other 
                              : ticket.issue_type}
                          </div>
                          <div className="message-text">
                            <strong>Description:</strong> {ticket.description}
                          </div>
                          {ticket.product && (
                            <div className="message-text">
                              <strong>Product:</strong> {ticket.product}
                            </div>
                          )}
                          {ticket.module && (
                            <div className="message-text">
                              <strong>Module:</strong> {ticket.module}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chat Messages */}
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`message ${msg.userType === 'customer' ? 'customer-message' : 'agent-message'} ${msg.isNew ? 'new-message' : ''} ${awsStyle ? 'aws-style' : ''}`}
                    >
                      {awsStyle ? (
                        // AWS Style Layout - Two Columns
                        <>
                          {/* Left Column - Chatter Info */}
                          <div className="aws-chatter-info">
                            <div className="chatter-name">
                              {msg.userType === 'customer' 
                                ? (msg.customerName || ticket.name)
                                : (msg.agentName || 'Agent')
                              }
                            </div>
                            <div className="message-date">
                              {new Date(msg.timestamp).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short'
                              })}
                            </div>
                          </div>
                          
                          {/* Right Column - Message Content */}
                          <div className="aws-message-content">
                            <div className="message-text">{msg.message}</div>
                          </div>
                        </>
                      ) : (
                        // Original Layout
                        <>
                          <div className="message-header">
                            <span className="sender-name">
                              {msg.userType === 'customer' 
                                ? (msg.customerName || ticket.name)
                                : (msg.agentName || 'Agent')
                              }
                            </span>
                            <span className="message-time">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                          <div className="message-content">
                            <div className="message-text">{msg.message}</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Input */}
            <div className="chat-input-container">
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <div className="input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={isConnected ? "Type your message..." : "Connecting..."}
                    className="chat-input"
                    rows="3"
                    disabled={sending}
                  />
                  <button 
                    type="submit" 
                    className="send-btn"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketChat; 