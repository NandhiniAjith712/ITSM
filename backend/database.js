const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'tick_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create tickets table with enhanced features
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(30) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mobile VARCHAR(15),
        country_code VARCHAR(10),
        description TEXT NOT NULL,
        issue_type VARCHAR(50),
        issue_type_other VARCHAR(100),
        issue_title VARCHAR(150),
        attachment_name VARCHAR(255),
        attachment_type VARCHAR(50),
        attachment LONGBLOB,
        assigned_to INT,
        assigned_by INT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('new', 'in_progress', 'closed', 'escalated') DEFAULT 'new',
        category VARCHAR(100),
        subcategory VARCHAR(100),
        satisfaction_rating INT,
        satisfaction_comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        closed_at DATETIME,
        resolution_time INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Add user_id column to tickets table if not exists (MySQL does not support IF NOT EXISTS for columns)
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN user_id INT`);
    } catch (e) {
      // Ignore duplicate column error
    }
    // Add foreign key constraint for user_id
    try {
      await connection.execute(`ALTER TABLE tickets ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`);
    } catch (e) {
      // Ignore duplicate constraint error
    }

    // Add country_code column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN country_code VARCHAR(10)`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add product_id column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN product_id INT`);
    } catch (e) {
      // Ignore duplicate column error
    }
    // Add foreign key constraint for product_id
    try {
      await connection.execute(`ALTER TABLE tickets ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`);
    } catch (e) {
      // Ignore duplicate constraint error
    }

    // Add assigned_to column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN assigned_to INT`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add assigned_by column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN assigned_by INT`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add priority column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add status column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN status ENUM('new', 'in_progress', 'closed', 'escalated') DEFAULT 'new'`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add issue_title column to tickets table if not exists
    try {
      await connection.execute(`ALTER TABLE tickets ADD COLUMN issue_title VARCHAR(150)`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add foreign key constraints for assigned_to and assigned_by
    try {
      await connection.execute(`ALTER TABLE tickets ADD CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL`);
    } catch (e) {
      // Ignore duplicate constraint error
    }

    try {
      await connection.execute(`ALTER TABLE tickets ADD CONSTRAINT fk_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL`);
    } catch (e) {
      // Ignore duplicate constraint error
    }

    // Create replies table with enhanced features
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create agents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('agent', 'manager', 'ceo') DEFAULT 'agent',
        department VARCHAR(100),
        manager_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login DATETIME,
        last_logout DATETIME,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create agent_sessions table for login/logout tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        logout_time DATETIME NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create ticket_assignments table for tracking ticket assignments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ticket_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        agent_id INT NOT NULL,
        assigned_by INT NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unassigned_at DATETIME NULL,
        assignment_reason TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_primary BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add missing columns to ticket_assignments table if not exists
    try {
      await connection.execute(`ALTER TABLE ticket_assignments ADD COLUMN assignment_reason TEXT`);
    } catch (e) {
      // Ignore duplicate column error
    }
    try {
      await connection.execute(`ALTER TABLE ticket_assignments ADD COLUMN is_active BOOLEAN DEFAULT TRUE`);
    } catch (e) {
      // Ignore duplicate column error
    }
    try {
      await connection.execute(`ALTER TABLE ticket_assignments ADD COLUMN unassigned_at DATETIME NULL`);
    } catch (e) {
      // Ignore duplicate column error
    }
    try {
      await connection.execute(`ALTER TABLE ticket_assignments ADD COLUMN is_primary BOOLEAN DEFAULT TRUE`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Create ticket_allocations table to store the current allocation (single row per ticket)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ticket_allocations (
        ticket_id INT PRIMARY KEY,
        agent_id INT NOT NULL,
        assigned_by INT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create users table with role-based access
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255),
        role ENUM('user', 'agent', 'manager', 'ceo', 'business_team') DEFAULT 'user',
        department VARCHAR(100),
        manager_id INT,
        phone VARCHAR(20),
        email_notifications BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME,
        FOREIGN KEY (manager_id) REFERENCES users(id)
      )
    `);

    // Add phone column to users table if not exists
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(20)`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add email_notifications column to users table if not exists
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Add missing columns to users table if not exists
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL`);
    } catch (e) {
      // Ignore duplicate column error
    }
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN email VARCHAR(100) NOT NULL UNIQUE`);
    } catch (e) {
      // Ignore duplicate column error
    }
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN role ENUM('user', 'agent', 'manager', 'support_manager', 'ceo', 'business_team') DEFAULT 'user'`);
    } catch (e) {
      // Ignore duplicate column error
    }

    // Update role ENUM to include support_manager if not exists
    try {
      await connection.execute(`ALTER TABLE users MODIFY COLUMN role ENUM('user', 'agent', 'manager', 'support_manager', 'ceo', 'business_team') DEFAULT 'user'`);
    } catch (e) {
      // Ignore error if ENUM already updated
      console.log('Role ENUM update skipped (may already be updated)');
    }

    // Update agents table role ENUM to include support_manager if not exists
    try {
      await connection.execute(`ALTER TABLE agents MODIFY COLUMN role ENUM('agent', 'manager', 'support_manager', 'ceo') DEFAULT 'agent'`);
    } catch (e) {
      // Ignore error if ENUM already updated
      console.log('Agents role ENUM update skipped (may already be updated)');
    }

    // Create performance ratings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        executive_id INT NOT NULL,
        manager_id INT NOT NULL,
        ticket_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (executive_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `);

    // Create WhatsApp conversations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS whatsapp_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        user_id INT,
        conversation_state JSON,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create products table with built-in SLA settings
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        sla_time_minutes INT NOT NULL DEFAULT 480 COMMENT 'SLA time in minutes (8 hours default)',
        priority_level ENUM('P0', 'P1', 'P2', 'P3') DEFAULT 'P2',
        escalation_time_minutes INT DEFAULT 240 COMMENT 'Time before escalation in minutes (4 hours default)',
        escalation_level ENUM('manager', 'technical_manager', 'ceo') DEFAULT 'manager',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create modules table for product sub-components
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create SLA configurations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sla_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        module_id INT NOT NULL,
        issue_name VARCHAR(150) NOT NULL,
        issue_description TEXT,
        priority_level ENUM('P0', 'P1', 'P2', 'P3') DEFAULT 'P2',
        response_time_minutes INT NOT NULL COMMENT 'First response time in minutes',
        resolution_time_minutes INT NOT NULL COMMENT 'Complete resolution time in minutes',
        business_hours_only BOOLEAN DEFAULT TRUE COMMENT 'Whether SLA applies only during business hours',
        escalation_time_minutes INT COMMENT 'Time before escalation in minutes',
        escalation_level ENUM('manager', 'technical_manager', 'ceo') DEFAULT 'manager',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        updated_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_sla_config (product_id, module_id, issue_name, priority_level)
      )
    `);

    // Create SLA timers table to track SLA compliance
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sla_timers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sla_configuration_id INT NOT NULL,
        timer_type ENUM('response', 'resolution', 'escalation') NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        pause_time DATETIME NULL,
        resume_time DATETIME NULL,
        total_elapsed_minutes INT DEFAULT 0,
        sla_deadline DATETIME NOT NULL,
        status ENUM('active', 'paused', 'completed', 'breached') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sla_configuration_id) REFERENCES sla_configurations(id) ON DELETE CASCADE
      )
    `);

    // Create escalations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS escalations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sla_timer_id INT NOT NULL,
        from_level ENUM('agent', 'manager', 'technical_manager', 'ceo') NOT NULL,
        to_level ENUM('manager', 'technical_manager', 'ceo') NOT NULL,
        reason TEXT,
        escalated_by INT NOT NULL,
        escalated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
        resolved_at DATETIME NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sla_timer_id) REFERENCES sla_timers(id) ON DELETE CASCADE,
        FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create chat_messages table for real-time chat functionality
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_type ENUM('agent', 'customer', 'system') NOT NULL,
        sender_id INT NULL,
        sender_name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'system', 'status_update', 'typing_indicator') DEFAULT 'text',
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at DATETIME NULL,
        parent_message_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
        INDEX idx_ticket_id (ticket_id),
        INDEX idx_sender_type (sender_type),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create chat_sessions table to track active chat sessions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        agent_id INT NULL,
        customer_id INT NULL,
        status ENUM('active', 'paused', 'closed') DEFAULT 'active',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME NULL,
        last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_ticket_id (ticket_id),
        INDEX idx_status (status)
      )
    `);

    // Create chat_participants table to track who's in each chat
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_id INT NULL,
        user_type ENUM('agent', 'customer') NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        left_at DATETIME NULL,
        is_typing BOOLEAN DEFAULT FALSE,
        last_typing_at DATETIME NULL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_user_type (user_type)
      )
    `);

    // Create current_assignments view for easy access to active assignments
    await connection.execute(`
      CREATE OR REPLACE VIEW current_assignments AS
      SELECT 
        ta.id as assignment_id,
        ta.ticket_id,
        ta.agent_id,
        u.name as agent_name,
        u.email as agent_email,
        u.role as agent_role,
        ta.assigned_by,
        assigned_by_user.name as assigned_by_name,
        ta.assigned_at,
        'manual' as assignment_type,
        COALESCE(t.priority, 'medium') as priority_level,
        ta.assignment_reason as assignment_notes,
        COALESCE(ta.is_primary, TRUE) as is_primary,
        COALESCE(t.status, 'new') as ticket_status,
        COALESCE(t.issue_title, t.description) as issue_title,
        t.created_at as ticket_created
      FROM ticket_assignments ta
      JOIN tickets t ON ta.ticket_id = t.id
      JOIN users u ON ta.agent_id = u.id
      LEFT JOIN users assigned_by_user ON ta.assigned_by = assigned_by_user.id
      WHERE ta.is_active = TRUE
    `);

    // Create assignment_history view for tracking assignment changes
    await connection.execute(`
      CREATE OR REPLACE VIEW assignment_history AS
      SELECT 
        ta.id as assignment_id,
        ta.ticket_id,
        ta.agent_id,
        u.name as agent_name,
        ta.assigned_by,
        assigned_by_user.name as assigned_by_name,
        ta.assigned_at,
        ta.unassigned_at,
        CASE 
          WHEN ta.is_active = TRUE THEN 'active'
          WHEN ta.unassigned_at IS NOT NULL THEN 'completed'
          ELSE 'inactive'
        END as status,
        'manual' as assignment_type,
        ta.assignment_reason as assignment_notes,
        CASE 
          WHEN ta.unassigned_at IS NOT NULL THEN 
            TIMESTAMPDIFF(MINUTE, ta.assigned_at, ta.unassigned_at)
          ELSE NULL
        END as duration_minutes,
        COALESCE(t.issue_title, t.description) as issue_title,
        COALESCE(t.status, 'new') as ticket_status
      FROM ticket_assignments ta
      JOIN tickets t ON ta.ticket_id = t.id
      JOIN users u ON ta.agent_id = u.id
      LEFT JOIN users assigned_by_user ON ta.assigned_by = assigned_by_user.id
    `);

    // Create agent_workload view for performance monitoring
    await connection.execute(`
      CREATE OR REPLACE VIEW agent_workload AS
      SELECT 
        u.id as agent_id,
        u.name as agent_name,
        u.email as agent_email,
        u.role as agent_role,
        COUNT(ta.id) as total_active_assignments,
        COUNT(CASE WHEN COALESCE(ta.is_primary, TRUE) = TRUE THEN 1 END) as primary_assignments,
        COUNT(CASE WHEN COALESCE(t.priority, 'medium') = 'urgent' THEN 1 END) as urgent_tickets,
        COUNT(CASE WHEN COALESCE(t.priority, 'medium') = 'high' THEN 1 END) as high_priority_tickets,
        ROUND(AVG(CASE 
          WHEN ta.unassigned_at IS NOT NULL THEN 
            TIMESTAMPDIFF(MINUTE, ta.assigned_at, ta.unassigned_at)
          ELSE NULL
        END), 2) as avg_workload_score,
        MIN(ta.assigned_at) as oldest_assignment,
        MAX(ta.assigned_at) as newest_assignment
      FROM users u
      LEFT JOIN ticket_assignments ta ON u.id = ta.agent_id AND ta.is_active = TRUE
      LEFT JOIN tickets t ON ta.ticket_id = t.id
      WHERE u.role IN ('agent', 'support_executive', 'support_manager')
      GROUP BY u.id, u.name, u.email, u.role
    `);

    console.log('✅ Database tables and views initialized successfully');
    connection.release();
  } catch (error) {
    console.error(' Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
}; 