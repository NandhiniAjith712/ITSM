import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GlobalLogin from './components/auth/GlobalLogin';
import UserRegistration from './components/auth/UserRegistration';
import AutoLoginPage from './components/common/AutoLoginPage';
import AutoLoginTest from './components/common/AutoLoginTest';
import UserDashboard from './components/dashboards/UserDashboard';
import AgentDashboard from './components/dashboards/AgentDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import CEODashboard from './components/dashboards/CEODashboard';
import BusinessDashboardAuth from './components/common/BusinessDashboardAuth';
import ProductDashboard from './components/dashboards/ProductDashboard';
import TicketsView from './components/tickets/TicketsView';
import TicketTableView from './components/tickets/TicketTableView';
import TicketViewDemo from './components/common/TicketViewDemo';
import SimpleTableTest from './components/common/SimpleTableTest';
import TicketDetailPage from './components/tickets/TicketDetailPage';
import CustomerChatPage from './components/chat/CustomerChatPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoLoginInProgress, setIsAutoLoginInProgress] = useState(false);

  useEffect(() => {
    console.log('🔄 App.js useEffect: Checking for stored user data...');
    
    // Clean up any invalid agent data that might be stored
    const cleanupInvalidData = () => {
      const agentData = localStorage.getItem('agentData');
      if (agentData) {
        try {
          const agent = JSON.parse(agentData);
          if (agent.role && agent.role !== 'user' && agent.role !== 'customer') {
            console.log('🧹 Cleaning up invalid agent data:', agent.role);
            localStorage.removeItem('agentData');
            localStorage.removeItem('agentToken');
          }
        } catch (error) {
          console.error('❌ Error parsing agent data:', error);
          localStorage.removeItem('agentData');
          localStorage.removeItem('agentToken');
        }
      }
    };
    
    cleanupInvalidData();
    
    // Check for session expiration
    const checkSessionExpiration = () => {
      const sessionExpires = localStorage.getItem('session_expires');
      const isLoggedIn = localStorage.getItem('is_logged_in');
      
      if (sessionExpires && isLoggedIn === 'true') {
        const expirationTime = new Date(sessionExpires);
        const currentTime = new Date();
        
        if (currentTime > expirationTime) {
          console.log('⏰ Session expired, clearing data');
          localStorage.removeItem('userData');
          localStorage.removeItem('userToken');
          localStorage.removeItem('is_logged_in');
          localStorage.removeItem('session_expires');
          localStorage.removeItem('login_timestamp');
          return false;
        }
        return true;
      }
      return false;
    };
    
    // Check for user data (unified format)
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ Found stored user data:', userData);
        
        // Check if session is still valid
        if (checkSessionExpiration()) {
          // For staff members, only allow if they came from global login (not auto-login)
          if (userData.role && ['support_executive', 'support_manager', 'ceo', 'admin'].includes(userData.role)) {
            // Check if this is from auto-login context
            const autoLoginContext = localStorage.getItem('autoLoginContext');
            if (autoLoginContext) {
              console.log('❌ Staff member found with auto-login context - clearing data');
              localStorage.removeItem('userData');
              localStorage.removeItem('autoLoginContext');
              setUser(null);
            } else {
              console.log('✅ Staff member authenticated via global login');
              setUser(userData);
            }
          } else if (userData.role && userData.role !== 'user' && userData.role !== 'customer') {
            console.log('❌ Invalid user role in stored data:', userData.role);
            localStorage.removeItem('userData');
            setUser(null);
          } else {
            setUser(userData);
          }
        } else {
          console.log('❌ Session expired, user needs to login again');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    } else {
      console.log('❌ No stored user data found');
    }

    // Check for legacy user format
    const legacyUser = localStorage.getItem('tickUser');
    if (legacyUser && !user) {
      try {
        const legacyUserData = JSON.parse(legacyUser);
        console.log('✅ Found legacy user data:', legacyUserData);
        
        // For staff members, only allow if they came from global login (not auto-login)
        if (legacyUserData.role && ['support_executive', 'support_manager', 'ceo', 'admin'].includes(legacyUserData.role)) {
          // Check if this is from auto-login context
          const autoLoginContext = localStorage.getItem('autoLoginContext');
          if (autoLoginContext) {
            console.log('❌ Staff member found with auto-login context in legacy data - clearing');
            localStorage.removeItem('tickUser');
            localStorage.removeItem('autoLoginContext');
          } else {
            console.log('✅ Staff member authenticated via global login (legacy)');
            setUser(legacyUserData);
          }
        } else if (legacyUserData.role && legacyUserData.role !== 'user' && legacyUserData.role !== 'customer') {
          console.log('❌ Invalid role in legacy user data:', legacyUserData.role);
          localStorage.removeItem('tickUser');
        } else {
          setUser(legacyUserData);
        }
      } catch (error) {
        console.error('❌ Error parsing legacy user data:', error);
        localStorage.removeItem('tickUser');
      }
    }

    // Check if auto-login is in progress (only for customers, not staff)
    const autoLoginContext = localStorage.getItem('autoLoginContext');
    if (autoLoginContext) {
      try {
        const context = JSON.parse(autoLoginContext);
        if (context.source === 'auto-login') {
          // Only allow auto-login for customers, not staff members
          const storedUser = localStorage.getItem('userData') || localStorage.getItem('tickUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role && ['support_executive', 'support_manager', 'ceo', 'admin'].includes(userData.role)) {
              console.log('❌ Auto-login context found for staff member - clearing');
              localStorage.removeItem('autoLoginContext');
              localStorage.removeItem('userData');
              localStorage.removeItem('tickUser');
            } else {
              console.log('🔄 Auto-login context found for customer, setting flag');
              setIsAutoLoginInProgress(true);
            }
          } else {
            console.log('🔄 Auto-login context found, setting flag');
            setIsAutoLoginInProgress(true);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing auto-login context:', error);
      }
    }

    // Auto-login functionality (if remember me was enabled and no valid session)
    const attemptAutoLogin = async () => {
      const rememberedLoginId = localStorage.getItem('remembered_login_id');
      const rememberedPassword = localStorage.getItem('remembered_password');
      const isLoggedIn = localStorage.getItem('is_logged_in');
      
      if (rememberedLoginId && rememberedPassword && isLoggedIn !== 'true' && !storedUser) {
        console.log('🔄 Attempting auto-login...');
        setIsAutoLoginInProgress(true);
        
        try {
          const response = await fetch('http://localhost:5000/api/auth/global-login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              login_id: rememberedLoginId,
              password: rememberedPassword
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Auto-login successful');
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            localStorage.setItem('userToken', data.data.token);
            localStorage.setItem('is_logged_in', 'true');
            localStorage.setItem('login_timestamp', new Date().toISOString());
            localStorage.setItem('session_expires', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
            setUser(data.data.user);
          } else {
            console.log('❌ Auto-login failed, clearing remembered credentials');
            localStorage.removeItem('remembered_login_id');
            localStorage.removeItem('remembered_password');
          }
        } catch (error) {
          console.error('❌ Auto-login error:', error);
          localStorage.removeItem('remembered_login_id');
          localStorage.removeItem('remembered_password');
        } finally {
          setIsAutoLoginInProgress(false);
        }
      }
    };
    
    // Attempt auto-login if no valid session found
    if (!storedUser || !checkSessionExpiration()) {
      attemptAutoLogin();
    }

    setIsLoading(false);
  }, []);

  const handleUserLogin = (userObj) => {
    console.log('🔐 App.js: User logged in:', userObj);
    console.log('🔍 User role:', userObj?.role);
    console.log('🔍 User ID:', userObj?.id);
    setUser(userObj);
    setIsAutoLoginInProgress(false);
  };

  const handleUserRegister = (userObj) => {
    console.log('📝 App.js: User registered:', userObj);
    setUser(userObj);
    setIsAutoLoginInProgress(false);
  };

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
    
    setUser(null);
    setIsAutoLoginInProgress(false);
  };

  // Function to render appropriate dashboard based on user role
  const renderDashboard = () => {
    console.log('🎯 renderDashboard called with user:', user);

    // If regular user is logged in, show user dashboard
    if (user) {
      console.log('✅ User is logged in, role:', user.role);
      
      // Validate user role - ensure only customers can access customer dashboard
      if (user.role && user.role !== 'user' && user.role !== 'customer') {
        console.log('❌ Invalid role for customer dashboard:', user.role);
        console.log('🔄 Clearing invalid user data and redirecting to login');
        handleLogout();
        return <Navigate to="/login" replace />;
      }
      
      // Only show customer dashboard for regular users
      return (
        <div>
          <UserDashboard user={user} />
        </div>
      );
    }

    // If no user and auto-login is not in progress, redirect to login page
    if (!isAutoLoginInProgress) {
      return <Navigate to="/login" replace />;
    }

    // If auto-login is in progress, show loading
    return <div className="loading">Auto-login in progress...</div>;
  };

  // Protected Route component for staff dashboards (no auto-login)
  const ProtectedRoute = ({ children }) => {
    console.log('🛡️ ProtectedRoute: isLoading=', isLoading, 'user=', user, 'isAutoLoginInProgress=', isAutoLoginInProgress);
    console.log('🔍 Current URL:', window.location.pathname);
    console.log('👤 User role:', user?.role);
    
    if (isLoading) {
      console.log('⏳ ProtectedRoute: Still loading...');
      return <div className="loading">Loading...</div>;
    }
    
    // For staff routes, no auto-login is allowed - must use global login
    if (!user) {
      console.log('❌ ProtectedRoute: No user found, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // Check if user is a staff member (agent, manager, ceo, admin)
    const isStaffMember = user.role && ['support_executive', 'support_manager', 'ceo', 'admin'].includes(user.role);
    if (!isStaffMember) {
      console.log('❌ ProtectedRoute: User is not a staff member, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log('✅ ProtectedRoute: Staff member authenticated, rendering children');
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<GlobalLogin onLogin={handleUserLogin} />} />
        <Route path="/user/register" element={<UserRegistration onRegister={handleUserRegister} />} />
        <Route path="/auto-login/:email/:product/:phone" element={<AutoLoginPage onLogin={handleUserLogin} />} />
        <Route path="/test-auto-login" element={<AutoLoginTest />} />
        
        {/* Business dashboard - accessible without login */}
        <Route path="/businessdashboard" element={<BusinessDashboardAuth />} />
        
        {/* Root route - redirect to appropriate dashboard based on user role */}
        <Route path="/" element={
          user ? (
            // Staff members go to their respective dashboards
            user.role === 'support_executive' || user.role === 'admin' ? (
              <Navigate to="/agentdashboard" replace />
            ) : user.role === 'support_manager' ? (
              <Navigate to="/manager" replace />
            ) : user.role === 'ceo' ? (
              <Navigate to="/ceo" replace />
            ) : (
              // Regular users go to user dashboard
              <Navigate to="/userdashboard" replace />
            )
          ) : isAutoLoginInProgress ? (
            <div className="loading">Auto-login in progress...</div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        {/* Public customer dashboard - no login required */}
        <Route path="/userdashboard" element={<UserDashboard user={user} />} />
        
        {/* Customer chat route - accessible from UserDashboard */}
        <Route path="/chat/:ticketId" element={<CustomerChatPage user={user} />} />
        
        {/* Protected staff routes - require global login, no auto-login */}
        <Route path="/agentdashboard" element={
          <ProtectedRoute>
            {(() => {
              console.log('🔍 AgentDashboard route check - user:', user);
              console.log('🔍 User role:', user?.role);
              return user && (user.role === 'support_executive' || user.role === 'admin') ? (
                <AgentDashboard agent={user} />
              ) : (
                <Navigate to="/login" replace />
              );
            })()}
          </ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute>
            {user && user.role === 'support_manager' ? (
              <ManagerDashboard manager={user} />
            ) : (
              <Navigate to="/login" replace />
            )}
          </ProtectedRoute>
        } />
        <Route path="/ceo" element={
          <ProtectedRoute>
            {user && user.role === 'ceo' ? (
              <CEODashboard ceo={user} />
            ) : (
              <Navigate to="/login" replace />
            )}
          </ProtectedRoute>
        } />
        <Route path="/products" element={<ProtectedRoute>{user && <ProductDashboard />}</ProtectedRoute>} />
        <Route path="/business-products" element={<ProductDashboard />} />
        <Route path="/tickets" element={<ProtectedRoute>{user && <TicketsView />}</ProtectedRoute>} />
        <Route path="/business-tickets" element={<TicketsView />} />
        <Route path="/tickets-table" element={<ProtectedRoute>{user && <TicketTableView />}</ProtectedRoute>} />
        <Route path="/ticket-demo" element={<ProtectedRoute>{user && <TicketViewDemo />}</ProtectedRoute>} />
        <Route path="/simple-test" element={<ProtectedRoute>{user && <SimpleTableTest />}</ProtectedRoute>} />
        <Route path="/ticket/:ticketId" element={<ProtectedRoute>{user && <TicketDetailPage />}</ProtectedRoute>} />
        
        {/* Catch all route - redirect to appropriate dashboard based on user role */}
        <Route path="*" element={
          user ? (
            // Staff members go to their respective dashboards
            user.role === 'support_executive' || user.role === 'admin' ? (
              <Navigate to="/agentdashboard" replace />
            ) : user.role === 'support_manager' ? (
              <Navigate to="/manager" replace />
            ) : user.role === 'ceo' ? (
              <Navigate to="/ceo" replace />
            ) : (
              // Regular users go to user dashboard
              <Navigate to="/userdashboard" replace />
            )
          ) : isAutoLoginInProgress ? (
            <div className="loading">Auto-login in progress...</div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
