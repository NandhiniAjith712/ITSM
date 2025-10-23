const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAgentRegistration = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['support_executive', 'support_manager', 'ceo']).withMessage('Invalid role. Must be: support_executive, support_manager, or ceo'),
  body('department').optional(),
  body('manager_id').optional()
];

const validateAgentLogin = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Helper function to hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Helper function to generate JWT token
const generateToken = (agent) => {
  return jwt.sign(
    { 
      agentId: agent.id, 
      name: agent.name
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '24h' }
  );
};

// Helper function to generate simple login ID (3 letters + 3 numbers)
const generateLoginId = (name) => {
  // Get first 3 letters of name, pad with 'X' if shorter
  const namePart = name.substring(0, 3).toLowerCase().padEnd(3, 'x');
  
  // Generate 3 random numbers
  const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
  
  return `${namePart}${numbers}`;
};

// Helper function to generate simple password (5 digits)
const generatePassword = () => {
  return Math.floor(Math.random() * 90000) + 10000; // 10000-99999
};

// POST /api/agents/register - Register new agent with simple auto-generated credentials
router.post('/register', validateAgentRegistration, async (req, res) => {
  try {
    console.log('🔍 Agent registration request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, role = 'support_executive', department = null, manager_id = null } = req.body;
    console.log('📝 Parsed data:', { name, email, role, department, manager_id });

    // Convert manager_id to integer or null
    const managerId = manager_id ? parseInt(manager_id) : null;
    console.log('🔢 Manager ID converted:', managerId);

    // Clean up department - convert empty string to null
    const cleanDepartment = department && department.trim() ? department.trim() : null;
    console.log('🏢 Department cleaned:', cleanDepartment);

    // Generate simple login ID and password
    const loginId = generateLoginId(name);
    const autoPassword = generatePassword();
    
    console.log('🔑 Generated credentials:', { loginId, autoPassword });

    // Check if agent already exists by name or email
    const [existingAgents] = await pool.execute(
      'SELECT id FROM agents WHERE name = ? OR email = ?',
      [name, email]
    );

    if (existingAgents.length > 0) {
      console.log('⚠️ Agent already exists:', existingAgents);
      return res.status(400).json({
        success: false,
        message: 'Agent with this name or email already exists'
      });
    }

    // Check if login ID already exists in agents table
    const [existingLoginIds] = await pool.execute(
      'SELECT id FROM agents WHERE login_id = ?',
      [loginId]
    );

    if (existingLoginIds.length > 0) {
      console.log('⚠️ Login ID already exists, regenerating:', loginId);
      // Regenerate if collision (very unlikely but possible)
      const newLoginId = generateLoginId(name);
      const newAutoPassword = generatePassword();
      console.log('🔑 Regenerated credentials:', { newLoginId, newAutoPassword });
    }

    // Hash the auto-generated password
    const hashedPassword = await hashPassword(autoPassword.toString());

    // Create agent in agents table
    const [agentResult] = await pool.execute(
      `INSERT INTO agents (name, email, password_hash, role, department, manager_id, is_active, login_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, cleanDepartment, managerId, true, loginId]
    );

    console.log('✅ Agent created with ID:', agentResult.insertId);

    // Get created agent (without password)
    const [newAgents] = await pool.execute(
      'SELECT id, name, email, role, department, manager_id, is_active, created_at FROM agents WHERE id = ?',
      [agentResult.insertId]
    );

    const newAgent = newAgents[0];

    // Return success with generated credentials
    res.status(201).json({
      success: true,
      message: 'Agent registered successfully',
      data: {
        agent: newAgent,
        credentials: {
          login_id: loginId,
          password: autoPassword,
          note: 'Please save these credentials securely. Password cannot be retrieved later.'
        }
      }
    });

    console.log('🎉 Agent registration completed successfully');

  } catch (error) {
    console.error('❌ Error registering agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register agent: ' + error.message
    });
  }
});

// POST /api/agents/login - Agent login
router.post('/login', validateAgentLogin, async (req, res) => {
  try {
    console.log('🔍 Agent login request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, password } = req.body;
    console.log('📝 Login attempt for:', { name, passwordLength: password.length });

    // Find agent by name or email
    const [agents] = await pool.execute(
      'SELECT * FROM agents WHERE name = ? OR email = ?',
      [name, name]
    );

    console.log('🔍 Found agents:', agents.length);

    if (agents.length === 0) {
      console.log('❌ No agent found with name/email:', name);
      return res.status(401).json({
        success: false,
        message: 'Invalid name/email or password'
      });
    }

    const agent = agents[0];
    console.log('👤 Agent found:', { id: agent.id, name: agent.name, email: agent.email, is_active: agent.is_active });

    // Check if agent is active
    if (!agent.is_active) {
      console.log('❌ Agent is not active:', agent.name);
      return res.status(401).json({
        success: false,
        message: 'Agent account is not active'
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, agent.password_hash);
    console.log('🔐 Password validation:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for agent:', agent.name);
      return res.status(401).json({
        success: false,
        message: 'Invalid name/email or password'
      });
    }

    // Update last login
    await pool.execute(
      'UPDATE agents SET last_login = NOW() WHERE id = ?',
      [agent.id]
    );

    // Generate session token
    const sessionToken = jwt.sign(
      { agentId: agent.id, name: agent.name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    // Return agent data (without password)
    const agentData = {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      role: agent.role || 'agent',
      department: agent.department,
      manager_id: agent.manager_id,
      is_active: agent.is_active,
      last_login: agent.last_login
    };

    console.log('✅ Login successful for agent:', agent.name);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        agent: agentData,
        token: sessionToken
      }
    });
  } catch (error) {
    console.error('❌ Agent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
});

// POST /api/agents/logout - Agent logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Agent logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// GET /api/agents/profile - Get agent profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 JWT Token payload:', req.user);
    const agentId = req.user.agentId || req.user.id;
    console.log('🔍 Extracted agent ID:', agentId);
    
    const [agents] = await pool.execute(
      'SELECT id, name, email FROM agents WHERE id = ?',
      [agentId]
    );

    console.log('🔍 Agent profile query result:', agents);
    console.log('🔍 Agent ID:', agentId);

    if (agents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const agentData = agents[0];
    console.log('🔍 Agent data being returned:', agentData);
    console.log('🔍 Agent email value:', agentData.email);
    console.log('🔍 Email type:', typeof agentData.email);

    res.json({
      success: true,
      data: agentData
    });
  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent profile'
    });
  }
});

// GET /api/agents - Get all agents (No authentication required)
router.get('/', async (req, res) => {
  try {
    const [agents] = await pool.execute(
      `SELECT id, name, email, role, department, manager_id, is_active, created_at, last_login 
       FROM agents 
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agents'
    });
  }
});

// GET /api/agents/ticket-counts - Get ticket counts for each agent
router.get('/ticket-counts', async (req, res) => {
  try {
    console.log('🔍 Fetching agent ticket counts');
    
    const [ticketCounts] = await pool.execute(`
      SELECT 
        a.id as agent_id,
        a.name as agent_name,
        COUNT(t.id) as ticket_count
      FROM agents a
      LEFT JOIN tickets t ON a.id = t.assigned_to
      WHERE a.is_active = TRUE
      GROUP BY a.id, a.name
      ORDER BY ticket_count DESC, a.name ASC
    `);
    
    console.log('✅ Found ticket counts for', ticketCounts.length, 'agents');
    
    res.json({
      success: true,
      data: ticketCounts
    });
    
  } catch (error) {
    console.error('❌ Error fetching agent ticket counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent ticket counts: ' + error.message
    });
  }
});

// DELETE /api/agents/:id - Delete agent and reassign tickets
router.delete('/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    console.log('🗑️ Agent deletion request for ID:', agentId);

    if (isNaN(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    // First, get agent details to check if they have assigned tickets
    const [agents] = await pool.execute(
      'SELECT * FROM agents WHERE id = ?',
      [agentId]
    );

    if (agents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const agent = agents[0];
    console.log('🔍 Found agent:', agent.name, 'Role:', agent.role);

    // Check if agent has assigned tickets
    const [assignedTickets] = await pool.execute(
      'SELECT COUNT(*) as ticketCount FROM tickets WHERE assigned_to = ?',
      [agentId]
    );

    const ticketCount = assignedTickets[0].ticketCount;
    console.log('📋 Agent has', ticketCount, 'assigned tickets');

    // If agent has tickets, reassign them to another available agent
    if (ticketCount > 0) {
      // Find another available agent (preferably same role)
      const [availableAgents] = await pool.execute(
        'SELECT id, name, role FROM agents WHERE id != ? AND is_active = TRUE ORDER BY role = ? DESC, id ASC LIMIT 1',
        [agentId, agent.role]
      );

      if (availableAgents.length > 0) {
        const newAgent = availableAgents[0];
        console.log('🔄 Reassigning tickets to:', newAgent.name, 'Role:', newAgent.role);

        // Reassign all tickets to the new agent
        await pool.execute(
          'UPDATE tickets SET assigned_to = ? WHERE assigned_to = ?',
          [newAgent.id, agentId]
        );

        console.log('✅ Reassigned', ticketCount, 'tickets to', newAgent.name);
      } else {
        // If no other agents available, assign tickets to system (unassigned)
        await pool.execute(
          'UPDATE tickets SET assigned_to = NULL WHERE assigned_to = ?',
          [agentId]
        );
        console.log('⚠️ No other agents available, tickets set to unassigned');
      }
    }

    // Delete agent from agents table
    await pool.execute(
      'DELETE FROM agents WHERE id = ?',
      [agentId]
    );

    // Note: Agents are only stored in agents table, not users table

    console.log('✅ Agent deleted successfully:', agent.name);

    res.json({
      success: true,
      message: `Agent ${agent.name} deleted successfully. ${ticketCount > 0 ? `${ticketCount} tickets were reassigned.` : ''}`,
      data: {
        deletedAgent: {
          id: agent.id,
          name: agent.name,
          role: agent.role
        },
        ticketsReassigned: ticketCount
      }
    });

  } catch (error) {
    console.error('❌ Error deleting agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent: ' + error.message
    });
  }
});

module.exports = router; 