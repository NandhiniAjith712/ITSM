const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../database');

const router = express.Router();

// Generate JWT token for staff
const generateStaffToken = (staff) => {
  return jwt.sign(
    { 
      id: staff.id, 
      email: staff.email, 
      role: staff.role,
      type: 'staff'
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// POST /api/staff/login - Staff login with login_id and password
router.post('/login', [
  body('login_id').notEmpty().withMessage('Login ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔍 Staff login request:', { login_id: req.body.login_id });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { login_id, password } = req.body;
    console.log('📝 Login attempt for login_id:', login_id);

    // Find staff by login_id (which is stored in the email field)
    const [staffMembers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND role IN (?, ?, ?)',
      [login_id, 'support_executive', 'support_manager', 'ceo']
    );
    
    console.log('🔍 Found staff members:', staffMembers.length);

    if (staffMembers.length === 0) {
      console.log('❌ Staff not found:', login_id);
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID or Password'
      });
    }

    const staff = staffMembers[0];
    console.log('✅ Staff found:', staff.name, 'Role:', staff.role);

    // Check if staff is active
    if (!staff.is_active) {
      console.log('❌ Staff account is not active:', staff.email);
      return res.status(401).json({
        success: false,
        message: 'Your account is not active. Please contact administrator.'
      });
    }

    // Verify password
    if (!staff.password_hash) {
      console.log('❌ Staff has no password hash:', staff.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID or Password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for staff:', staff.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID or Password'
      });
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [staff.id]
    );

    // Generate JWT token
    const token = generateStaffToken(staff);

    // Return staff data (without password)
    const staffData = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      manager_id: staff.manager_id,
      is_active: staff.is_active,
      created_at: staff.created_at,
      last_login: staff.last_login
    };

    console.log('✅ Staff login successful for:', staff.name, 'Role:', staff.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        staff: staffData,
        token
      }
    });
  } catch (error) {
    console.error('❌ Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
});

// GET /api/staff/profile - Get staff profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    // This would be protected by middleware in production
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    const [staffMembers] = await pool.execute(
      'SELECT id, name, email, role, department, manager_id, is_active, created_at, last_login FROM users WHERE id = ? AND role IN (?, ?, ?)',
      [id, 'support_executive', 'support_manager', 'ceo']
    );

    if (staffMembers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    const staff = staffMembers[0];

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('❌ Get staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff profile: ' + error.message
    });
  }
});

module.exports = router;
