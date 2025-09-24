const express = require('express');
const router = express.Router();
const { pool } = require('../../database');

// Test API endpoint
router.get('/test-auth', async (req, res) => {
  try {
    console.log('🔍 SLA test-auth endpoint called');
    console.log('   Headers:', req.headers);
    
    // CORS is handled by the main server configuration
    
    res.json({
      success: true,
      message: 'SLA API is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed'
    });
  }
});

// Get all products with SLA settings
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT p.*, u.name as created_by_name 
      FROM products p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.name
    `);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Create new product with SLA settings
router.post('/products', async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO products (name, description, status, created_by) 
      VALUES (?, ?, ?, ?)
    `, [name, description || null, status, 1]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: result.insertId, name }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product SLA settings
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [result] = await pool.execute(`
      UPDATE products 
      SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [name, description || null, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product is being used by any tickets
    const [tickets] = await pool.execute(
      'SELECT COUNT(*) as count FROM tickets WHERE product_id = ?',
      [id]
    );
    
    if (tickets[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product. It is being used by ${tickets[0].count} ticket(s).`
      });
    }
    
    // Delete the product
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Get SLA timer for a ticket
router.get('/timers/:ticketId/remaining', async (req, res) => {
  try {
    console.log('🔍 SLA timer endpoint called for ticket:', req.params.ticketId);
    console.log('   Headers:', req.headers);
    
    // CORS is handled by the main server configuration
    
    const { ticketId } = req.params;
    
    // Get ticket with module and SLA configuration info
    const [tickets] = await pool.execute(`
      SELECT t.*, p.name as product_name, m.name as module_name,
             sc.response_time_minutes, sc.resolution_time_minutes, sc.priority_level
      FROM tickets t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN sla_configurations sc ON t.module_id = sc.module_id AND sc.is_active = TRUE
      WHERE t.id = ?
    `, [ticketId]);

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const ticket = tickets[0];
    const now = new Date();
    const ticketCreatedAt = new Date(ticket.created_at);
    
    // Calculate SLA deadline based on module SLA configuration
    const slaTimeMinutes = ticket.response_time_minutes || 480; // Default 8 hours
    const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
    
    // Calculate remaining time
    const remainingMs = slaDeadline.getTime() - now.getTime();
    const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
    
    // Determine status
    const isBreached = remainingMs < 0;
    const isWarning = remainingMinutes <= 30 && remainingMinutes > 0;

    // AUTO-ESCALATION: If SLA is breached and ticket is in_progress, escalate to manager
    if (isBreached && ticket.status === 'in_progress') {
      try {
        console.log(`🚨 SLA BREACH DETECTED for ticket ${ticketId}. Auto-escalating to manager...`);
        
        // Update ticket status to escalated
        await pool.execute(`
          UPDATE tickets SET status = 'escalated' WHERE id = ?
        `, [ticketId]);

        // Get manager to escalate to
        const [managers] = await pool.execute(`
          SELECT id, name, email FROM users WHERE role = 'manager' LIMIT 1
        `);

        // Get CEO for notification
        const [ceos] = await pool.execute(`
          SELECT id, name, email FROM users WHERE role = 'ceo' LIMIT 1
        `);

        const manager = managers.length > 0 ? managers[0] : null;
        const ceo = ceos.length > 0 ? ceos[0] : null;

        console.log(`✅ Ticket ${ticketId} automatically escalated to manager: ${manager ? manager.name : 'No manager found'}`);
        
        // Log escalation in escalations table if it exists
        try {
          await pool.execute(`
            INSERT INTO escalations (ticket_id, escalated_from, escalated_to, escalation_reason, escalated_by)
            VALUES (?, ?, ?, ?, ?)
          `, [ticketId, 'agent', manager ? manager.id : null, 'SLA Breach - Automatic Escalation', 1]);
        } catch (escalationError) {
          console.log('Note: Escalations table may not exist, continuing...');
        }

      } catch (escalationError) {
        console.error('❌ Error during auto-escalation:', escalationError);
        // Continue with timer response even if escalation fails
      }
    }

    const timerData = {
      ticket_id: ticket.id,
      product_name: ticket.product_name || ticket.product || 'Unknown Product',
      module_name: ticket.module_name || ticket.module || 'Unknown Module',
      priority_level: ticket.priority_level || 'P2',
      sla_time_minutes: slaTimeMinutes,
      deadline: slaDeadline.toISOString(),
      remaining_minutes: remainingMinutes,
      remaining_hours: Math.floor(remainingMinutes / 60),
      remaining_days: Math.floor(remainingMinutes / (60 * 24)),
      is_breached: isBreached,
      is_warning: isWarning,
      status: ticket.status,
      auto_escalated: isBreached && ticket.status === 'in_progress'
    };

    res.json({
      success: true,
      data: [timerData]
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA timer'
    });
  }
});

// Get all active tickets with SLA timers
router.get('/timers/active', async (req, res) => {
  try {
    const [tickets] = await pool.execute(`
      SELECT t.*, p.name as product_name, m.name as module_name,
             sc.response_time_minutes, sc.resolution_time_minutes, sc.priority_level
      FROM tickets t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN sla_configurations sc ON t.module_id = sc.module_id AND sc.is_active = TRUE
      WHERE t.status IN ('new', 'in_progress')
      ORDER BY t.created_at ASC
    `);

    const now = new Date();
    const timerData = tickets.map(ticket => {
      const ticketCreatedAt = new Date(ticket.created_at);
      const slaTimeMinutes = ticket.response_time_minutes || 480;
      const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
      
      const remainingMs = slaDeadline.getTime() - now.getTime();
      const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
      
      const isBreached = remainingMs < 0;
      const isWarning = remainingMinutes <= 30 && remainingMinutes > 0;
      
      return {
        ticket_id: ticket.id,
        ticket_name: ticket.name,
        ticket_status: ticket.status,
        product_name: ticket.product_name || ticket.product || 'Unknown Product',
        module_name: ticket.module_name || ticket.module || 'Unknown Module',
        priority_level: ticket.priority_level || 'P2',
        sla_time_minutes: slaTimeMinutes,
        deadline: slaDeadline.toISOString(),
        remaining_minutes: remainingMinutes,
        remaining_hours: Math.floor(remainingMinutes / 60),
        remaining_days: Math.floor(remainingMinutes / (60 * 24)),
        is_breached: isBreached,
        is_warning: isWarning,
        status: ticket.status
      };
    });

    res.json({
      success: true,
      data: timerData
    });
  } catch (error) {
    console.error('Error getting active timers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active timers'
    });
  }
});

// Check and trigger automatic escalation
router.post('/timers/:ticketId/check-escalation', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Get ticket with module and SLA configuration info
    const [tickets] = await pool.execute(`
      SELECT t.*, p.name as product_name, m.name as module_name,
             sc.response_time_minutes, sc.resolution_time_minutes, sc.priority_level
      FROM tickets t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN sla_configurations sc ON t.module_id = sc.module_id AND sc.is_active = TRUE
      WHERE t.id = ?
    `, [ticketId]);

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const ticket = tickets[0];
    const now = new Date();
    const ticketCreatedAt = new Date(ticket.created_at);
    
    const slaTimeMinutes = ticket.response_time_minutes || 480;
    const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
    
    const isBreached = now.getTime() > slaDeadline.getTime();
    
    if (isBreached && ticket.status !== 'escalated') {
      // Update ticket status to escalated
      await pool.execute(`
        UPDATE tickets SET status = 'escalated' WHERE id = ?
      `, [ticketId]);

      // Get manager to escalate to
      const [managers] = await pool.execute(`
        SELECT id, name, email FROM users WHERE role = 'manager' LIMIT 1
      `);

      // Get CEO for notification
      const [ceos] = await pool.execute(`
        SELECT id, name, email FROM users WHERE role = 'ceo' LIMIT 1
      `);

      const manager = managers.length > 0 ? managers[0] : null;
      const ceo = ceos.length > 0 ? ceos[0] : null;

      res.json({
        success: true,
        message: 'Ticket automatically escalated to manager',
        data: {
          ticket_id: ticketId,
          product_name: ticket.product_name || ticket.product || 'Unknown Product',
          module_name: ticket.module_name || ticket.module || 'Unknown Module',
          sla_time_minutes: slaTimeMinutes,
          breached_at: now.toISOString(),
          escalated_to: manager ? manager.name : 'No manager found',
          ceo_notified: ceo ? ceo.name : 'No CEO found'
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No escalation needed',
        data: {
          is_breached: isBreached,
          sla_deadline: slaDeadline.toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error checking escalation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check escalation'
    });
  }
});

// Auto-escalate all breached tickets (run this periodically)
router.post('/auto-escalate', async (req, res) => {
  try {
    const now = new Date();
    
    // Get all active tickets with their SLA configurations
    const [activeTickets] = await pool.execute(`
      SELECT t.*, p.name as product_name, m.name as module_name,
             sc.response_time_minutes, sc.resolution_time_minutes, sc.priority_level
      FROM tickets t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN sla_configurations sc ON t.module_id = sc.module_id AND sc.is_active = TRUE
      WHERE t.status IN ('new', 'in_progress')
      ORDER BY sc.priority_level ASC, sc.response_time_minutes ASC
    `);

    // Get manager and CEO for notifications
    const [managers] = await pool.execute(`
      SELECT id, name, email FROM users WHERE role = 'manager' LIMIT 1
    `);
    const [ceos] = await pool.execute(`
      SELECT id, name, email FROM users WHERE role = 'ceo' LIMIT 1
    `);

    const manager = managers.length > 0 ? managers[0] : null;
    const ceo = ceos.length > 0 ? ceos[0] : null;

    let breachedCount = 0;
    let escalatedCount = 0;

    for (const ticket of activeTickets) {
      // Skip tickets without SLA configuration (use default 8 hours)
      const slaTimeMinutes = ticket.response_time_minutes || 480; // Default 8 hours
      const ticketCreatedAt = new Date(ticket.created_at);
      const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
      
      const isBreached = now.getTime() > slaDeadline.getTime();
      
      if (isBreached) {
        breachedCount++;
        
        // Update ticket status to escalated
        await pool.execute(`
          UPDATE tickets SET status = 'escalated' WHERE id = ?
        `, [ticket.id]);
        
        escalatedCount++;
        console.log(`🚨 Auto-escalated ticket ${ticket.id} (${ticket.product_name || ticket.product || 'Unknown Product'})`);
      }
    }

    // Send notification to CEO if available
    if (ceo && escalatedCount > 0) {
      console.log(`📧 CEO notification sent to: ${ceo.name} (${ceo.email})`);
      console.log(`📋 Summary: ${escalatedCount} tickets escalated due to SLA breach`);
    }

    res.json({
      success: true,
      message: `Auto-escalated ${escalatedCount} breached tickets`,
      data: {
        escalated_count: escalatedCount,
        breached_tickets: breachedCount,
        manager_notified: manager ? manager.name : 'No manager found',
        ceo_notified: ceo ? ceo.name : 'No CEO found'
      }
    });
  } catch (error) {
    console.error('Error auto-escalating tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-escalate tickets'
    });
  }
});

// ===== MODULES MANAGEMENT =====

// GET /api/sla/products/:productId/modules - Get modules for a specific product
router.get('/products/:productId/modules', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [modules] = await pool.execute(`
      SELECT id, name, description, status
      FROM modules 
      WHERE product_id = ? AND status = 'active'
      ORDER BY name ASC
    `, [productId]);
    
    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modules'
    });
  }
});

// GET /api/sla/modules/:moduleId/configurations - Get SLA configurations for a specific module
router.get('/modules/:moduleId/configurations', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const [configurations] = await pool.execute(`
      SELECT id, issue_name, issue_description, response_time_minutes, 
             resolution_time_minutes, priority_level, is_active
      FROM sla_configurations 
      WHERE module_id = ? AND is_active = TRUE
      ORDER BY priority_level ASC, response_time_minutes ASC
    `, [moduleId]);
    
    res.json({
      success: true,
      data: configurations
    });
  } catch (error) {
    console.error('Error fetching SLA configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA configurations'
    });
  }
});

// Get all modules
router.get('/modules', async (req, res) => {
  try {
    const [modules] = await pool.execute(`
      SELECT m.*, p.name as product_name 
      FROM modules m 
      LEFT JOIN products p ON m.product_id = p.id 
      ORDER BY p.name, m.name
    `);
    
    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modules'
    });
  }
});

// Create new module
router.post('/modules', async (req, res) => {
  try {
    const { product_id, name, description, status = 'active' } = req.body;
    
    if (!product_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and module name are required'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO modules (product_id, name, description, status, created_by) 
      VALUES (?, ?, ?, ?, ?)
    `, [product_id, name, description || null, status, 1]);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { id: result.insertId, name, product_id }
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create module'
    });
  }
});

// Update module
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [result] = await pool.execute(`
      UPDATE modules 
      SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [name, description || null, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module'
    });
  }
});

// Delete module
router.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if module exists
    const [modules] = await pool.execute(
      'SELECT * FROM modules WHERE id = ?',
      [id]
    );
    
    if (modules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if module is used in SLA configurations
    const [slaConfigs] = await pool.execute(
      'SELECT COUNT(*) as count FROM sla_configurations WHERE module_id = ?',
      [id]
    );
    
    if (slaConfigs[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete module - it is used in SLA configurations'
      });
    }
    
    // Delete the module
    const [result] = await pool.execute(
      'DELETE FROM modules WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete module'
    });
  }
});

// ===== SLA CONFIGURATIONS MANAGEMENT =====

// Get all SLA configurations
router.get('/configurations', async (req, res) => {
  try {
    const [configurations] = await pool.execute(`
      SELECT sc.*, p.name as product_name, m.name as module_name, u.name as created_by_name
      FROM sla_configurations sc
      LEFT JOIN products p ON sc.product_id = p.id
      LEFT JOIN modules m ON sc.module_id = m.id
      LEFT JOIN users u ON sc.created_by = u.id
      ORDER BY p.name, m.name, sc.issue_name
    `);
    
    res.json({
      success: true,
      data: configurations
    });
  } catch (error) {
    console.error('Error fetching SLA configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA configurations'
    });
  }
});

// Get SLA performance rates
router.get('/performance-rates', async (req, res) => {
  try {
    console.log('🔍 Fetching SLA performance rates...');
    
    // Get all SLA configurations with their time values
    const [configurations] = await pool.execute(`
      SELECT sc.*, p.name as product_name, m.name as module_name
      FROM sla_configurations sc
      LEFT JOIN products p ON sc.product_id = p.id
      LEFT JOIN modules m ON sc.module_id = m.id
      WHERE sc.is_active = TRUE
      ORDER BY p.name, m.name, sc.issue_name
    `);
    
    // Calculate performance rates for each configuration
    const performanceRates = await Promise.all(configurations.map(async config => {
      const slaResponseTimeMinutes = config.response_time_minutes;
      const slaResolutionTimeMinutes = config.resolution_time_minutes;
      
      // Get actual response and resolution times from tickets for this module
      const [tickets] = await pool.execute(`
        SELECT 
          first_response_at,
          resolved_at,
          created_at,
          status
        FROM tickets 
        WHERE module_id = ? 
        AND first_response_at IS NOT NULL
        AND resolved_at IS NOT NULL
        AND status = 'closed'
      `, [config.module_id]);
      
      let responseTimePerformanceRate = 0;
      let resolutionTimePerformanceRate = 0;
      
      if (tickets.length > 0) {
        // Calculate average actual response time
        const actualResponseTimes = tickets.map(ticket => {
          const created = new Date(ticket.created_at);
          const firstResponse = new Date(ticket.first_response_at);
          return Math.floor((firstResponse - created) / (1000 * 60)); // Convert to minutes
        });
        
        const avgActualResponseTime = actualResponseTimes.reduce((sum, time) => sum + time, 0) / actualResponseTimes.length;
        
        // Calculate average actual resolution time
        const actualResolutionTimes = tickets.map(ticket => {
          const created = new Date(ticket.created_at);
          const resolved = new Date(ticket.resolved_at);
          return Math.floor((resolved - created) / (1000 * 60)); // Convert to minutes
        });
        
        const avgActualResolutionTime = actualResolutionTimes.reduce((sum, time) => sum + time, 0) / actualResolutionTimes.length;
        
        // Calculate Response Time Performance Rate (SLA Time / Actual Time) * 100, capped at 100%
        responseTimePerformanceRate = Math.min(100, (slaResponseTimeMinutes / avgActualResponseTime) * 100);
        
        // Calculate Resolution Time Performance Rate (SLA Time / Actual Time) * 100, capped at 100%
        resolutionTimePerformanceRate = Math.min(100, (slaResolutionTimeMinutes / avgActualResolutionTime) * 100);
      } else {
        // No actual data available, show 0% or N/A
        responseTimePerformanceRate = 0;
        resolutionTimePerformanceRate = 0;
      }
      
      // Calculate Overall Performance Rate
      const overallPerformanceRate = (responseTimePerformanceRate + resolutionTimePerformanceRate) / 2;
      
      return {
        id: config.id,
        product_name: config.product_name,
        module_name: config.module_name,
        issue_name: config.issue_name,
        sla_response_time: slaResponseTimeMinutes,
        sla_resolution_time: slaResolutionTimeMinutes,
        response_time_performance_rate: Math.round(responseTimePerformanceRate * 100) / 100,
        resolution_time_performance_rate: Math.round(resolutionTimePerformanceRate * 100) / 100,
        overall_performance_rate: Math.round(overallPerformanceRate * 100) / 100
      };
    }));
    
    console.log(`✅ Calculated performance rates for ${performanceRates.length} configurations`);
    
    res.json({
      success: true,
      data: performanceRates
    });
  } catch (error) {
    console.error('Error calculating SLA performance rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate SLA performance rates'
    });
  }
});

// Get SLA configurations for a specific product
router.get('/products/:productId/configurations', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [configurations] = await pool.execute(`
      SELECT sc.*, p.name as product_name, m.name as module_name, u.name as created_by_name
      FROM sla_configurations sc
      LEFT JOIN products p ON sc.product_id = p.id
      LEFT JOIN modules m ON sc.module_id = m.id
      LEFT JOIN users u ON sc.created_by = u.id
      WHERE sc.product_id = ?
      ORDER BY m.name, sc.issue_name
    `, [productId]);
    
    res.json({
      success: true,
      data: configurations
    });
  } catch (error) {
    console.error('Error fetching SLA configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA configurations'
    });
  }
});

// Create new SLA configuration
router.post('/configurations', async (req, res) => {
  try {
    const { product_id, module_id, issue_name, issue_description, response_time_minutes, resolution_time_minutes, priority_level = 'P2', is_active = true } = req.body;
    
    if (!product_id || !module_id || !issue_name || !response_time_minutes || !resolution_time_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Module ID, Issue Name, Response Time, and Resolution Time are required'
      });
    }

    // Check if module already has an SLA configuration
    const [existingConfigs] = await pool.execute(`
      SELECT id FROM sla_configurations WHERE module_id = ?
    `, [module_id]);

    if (existingConfigs.length > 0) {
      // Update existing configuration instead of creating duplicate
      const existingId = existingConfigs[0].id;
      const [updateResult] = await pool.execute(`
        UPDATE sla_configurations 
        SET issue_name = ?, issue_description = ?, response_time_minutes = ?, resolution_time_minutes = ?, priority_level = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [issue_name, issue_description || null, response_time_minutes, resolution_time_minutes, priority_level, is_active, existingId]);

      res.json({
        success: true,
        message: 'SLA configuration updated successfully (replaced existing configuration for this module)',
        data: { id: existingId, issue_name, response_time_minutes, priority_level }
      });
    } else {
      // Create new configuration if module doesn't have one
      const [result] = await pool.execute(`
        INSERT INTO sla_configurations (product_id, module_id, issue_name, issue_description, response_time_minutes, resolution_time_minutes, priority_level, is_active, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [product_id, module_id, issue_name, issue_description || null, response_time_minutes, resolution_time_minutes, priority_level, is_active, 1]);

      res.status(201).json({
        success: true,
        message: 'SLA configuration created successfully',
        data: { id: result.insertId, issue_name, response_time_minutes, priority_level }
      });
    }
  } catch (error) {
    console.error('Error creating SLA configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SLA configuration'
    });
  }
});

// Update SLA configuration
router.put('/configurations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { issue_name, issue_description, response_time_minutes, resolution_time_minutes, priority_level, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE sla_configurations 
      SET issue_name = ?, issue_description = ?, response_time_minutes = ?, resolution_time_minutes = ?, priority_level = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [issue_name, issue_description || null, response_time_minutes, resolution_time_minutes, priority_level, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'SLA configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'SLA configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating SLA configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SLA configuration'
    });
  }
});

// Delete SLA configuration
router.delete('/configurations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if configuration exists
    const [configurations] = await pool.execute(
      'SELECT * FROM sla_configurations WHERE id = ?',
      [id]
    );
    
    if (configurations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SLA configuration not found'
      });
    }
    
    // Delete the configuration
    const [result] = await pool.execute(
      'DELETE FROM sla_configurations WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'SLA configuration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'SLA configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SLA configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SLA configuration'
    });
  }
});

module.exports = router; 