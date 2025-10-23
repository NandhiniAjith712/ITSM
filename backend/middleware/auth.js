const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database');

// Permission matrix for the 3 main roles
const permissions = {
  support_executive: [
    'view_assigned_tickets',
    'reply_to_tickets',
    'update_ticket_status',
    'send_whatsapp_notifications',
    'view_customer_history'
  ],
  support_manager: [
    'view_all_tickets',
    'assign_tickets',
    'rate_performance',
    'view_analytics',
    'generate_reports',
    'escalate_tickets',
    'manage_agents'
  ],
  ceo: [
    'view_all_data',
    'view_analytics',
    'view_reports',
    'view_business_intelligence',
    'view_performance_metrics'
  ],
  user: [
    'view_assigned_tickets',
    'reply_to_tickets',
    'update_ticket_status',
    'send_whatsapp_notifications',
    'view_customer_history'
  ]
};

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    console.log('🔍 Debug - JWT decoded:', decoded);
    
    // Get user ID from token (handle userId, id, and agentId fields)
    const userId = decoded.userId || decoded.id || decoded.agentId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - no user ID found'
      });
    }
    
    // First try to find in agents table (for staff members)
    let [agents] = await pool.execute(
      'SELECT id, name, email, role FROM agents WHERE id = ? AND is_active = TRUE',
      [userId]
    );

    if (agents.length > 0) {
      // Agent found in agents table
      const agent = agents[0];
      console.log('🔍 Debug - Agent found:', agent);
      
      req.user = {
        id: agent.id,
        agentId: agent.id,
        email: agent.email,
        name: agent.name,
        role: agent.role || 'support_executive',
        department: 'IT Support',
        permissions: permissions[agent.role] || permissions['support_executive'] || []
      };
    } else {
      // Agent not found, try users table (for customers)
      let [users] = await pool.execute(
        'SELECT id, email, name, role, department, manager_id, is_active FROM users WHERE id = ? AND is_active = TRUE',
        [userId]
      );

      if (users.length > 0) {
        // User found in users table
        const user = users[0];
        console.log('🔍 Debug - User found:', user);
        
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          managerId: user.manager_id,
          permissions: permissions[user.role] || []
        };
      } else {
        // User not found in either table
        console.log('❌ Debug - User not found in either table for ID:', userId);
        return res.status(401).json({
          success: false,
          message: 'Invalid or inactive user'
        });
      }
    }

    console.log('🔍 Debug - Final req.user:', req.user);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Authorize specific role
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check specific permission
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    next();
  };
};

    // Check if user can access ticket
const canAccessTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id || req.body.ticketId;
    if (!ticketId) {
      return next();
    }

    const [tickets] = await pool.execute(
      'SELECT user_id, assigned_to FROM tickets WHERE id = ?',
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const ticket = tickets[0];
    
    // Handle role mapping: support_executive in agents table maps to 'user' in users table
    const isSupportExecutive = req.user.role === 'support_executive' || 
                              (req.user.role === 'user' && req.user.agentId); // Check if user has agentId (indicating they're a support executive)
    
    const canAccess = 
      req.user.role === 'admin' ||
      req.user.role === 'ceo' ||
      req.user.role === 'support_manager' ||
      (isSupportExecutive && ticket.assigned_to === req.user.id) ||
      (req.user.role === 'user' && ticket.user_id === req.user.id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ticket'
      });
    }

    req.ticket = ticket;
    next();
  } catch (error) {
    console.error('Ticket access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking ticket access'
    });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      managerId: user.manager_id
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '7d' } // Extended from 24h to 7 days
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  authenticateToken,
  authorizeRole,
  checkPermission,
  canAccessTicket,
  generateToken,
  hashPassword,
  comparePassword,
  permissions
}; 