const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database');
const { upload, handleUploadError } = require('../middleware/upload');
const axios = require('axios');
const TextFormatter = require('../utils/textFormatter');
const TicketAssignmentService = require('../utils/ticketAssignment');

const path = require('path');
const fs = require('fs');

// WhatsApp API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "521803094347148";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Add timeout and retry configuration
const axiosConfig = {
  timeout: 15000, // 15 seconds
  headers: {
    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Tick-System/1.0'
  },
  // Uncomment if you need to use a proxy
  // proxy: {
  //   host: 'proxy.company.com',
  //   port: 8080,
  //   auth: {
  //     username: 'username',
  //     password: 'password'
  //   }
  // }
};

// Function to send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    // Check if WhatsApp is properly configured
    if (!WHATSAPP_ACCESS_TOKEN || WHATSAPP_ACCESS_TOKEN === 'YOUR_ACTUAL_NEW_TOKEN_FROM_META_DEVELOPER_CONSOLE' || !WHATSAPP_PHONE_NUMBER_ID) {
      console.log('❌ WhatsApp API not configured');
      console.log('💡 WhatsApp notifications are temporarily disabled until you get a valid access token');
      return null;
    }

    console.log(`📤 Attempting to send WhatsApp message to ${phoneNumber}`);
    console.log(`🌐 API URL: ${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      axiosConfig
    );

    console.log('✅ WhatsApp notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Network error: Cannot reach Facebook Graph API. Check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout error: Request took too long to complete.');
    } else {
      console.error('❌ Error sending WhatsApp notification:', error.response?.data || error.message);
    }
    return null;
  }
}

const router = express.Router();

// POST /api/tickets/auto-login-context - Store auto-login context for form pre-filling
router.post('/auto-login-context', async (req, res) => {
  try {
    const { email, product, phone, timestamp, source } = req.body;
    
    console.log('🔗 Storing auto-login context:', { email, product, phone, source });
    
    // Store auto-login context in a temporary table or session storage
    // For now, we'll store it in the tickets table with a special flag
    // In production, you might want a separate table for this
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM agents WHERE email = ?',
      [email]
    );
    
    let userId = null;
    if (users.length > 0) {
      userId = users[0].id;
    }
    
    // Store context in a temporary way (you can modify this based on your needs)
    const autoLoginContext = {
      email,
      product,
      phone,
      timestamp,
      source,
      userId
    };
    
    // For now, we'll just log it and return success
    // In a real implementation, you might store this in Redis, a database table, or session storage
    console.log('✅ Auto-login context stored:', autoLoginContext);
    
    res.json({
      success: true,
      message: 'Auto-login context stored successfully',
      data: autoLoginContext
    });
  } catch (error) {
    console.error('❌ Error storing auto-login context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store auto-login context'
    });
  }
});

// GET /api/tickets/auto-login-context/:email - Get auto-login context for a user
router.get('/auto-login-context/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('🔍 Retrieving auto-login context for:', email);
    
    // In a real implementation, you would retrieve this from your storage
    // For now, we'll return a mock response
    const mockContext = {
      email,
      product: 'ProjectX', // Default product
      phone: '1234567890', // Default phone
      timestamp: new Date().toISOString(),
      source: 'auto-login'
    };
    
    res.json({
      success: true,
      message: 'Auto-login context retrieved successfully',
      data: mockContext
    });
  } catch (error) {
    console.error('❌ Error retrieving auto-login context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve auto-login context'
    });
  }
});

// GET /api/tickets - Get all tickets with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        t.id, 
        t.name, 
        t.email, 
        t.mobile, 
        t.product, 
        t.product_id, 
        t.module, 
        t.module_id, 
        t.description, 
        t.issue_type, 
        t.issue_type_other, 
        t.issue_title, 
        t.attachment_name, 
        t.attachment_type, 
        t.status, 
        t.user_id, 
        t.assigned_to,
        t.assigned_by,
        t.created_at, 
        t.updated_at,
        u.name as assigned_to_name,
        u.email as assigned_to_email,
        ta.agent_id as allocation_agent_id
      FROM tickets t
      LEFT JOIN agents u ON t.assigned_to = u.id
      LEFT JOIN ticket_allocations ta ON ta.ticket_id = t.id
    `;
    const params = [];
    
    if (status && ['new', 'in_progress', 'closed'].includes(status)) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [tickets] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// GET /api/tickets/:id - Get single ticket with replies
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ticket details with assigned agent information
    const [tickets] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email,
        ta.agent_id as allocation_agent_id
      FROM tickets t
      LEFT JOIN agents u ON t.assigned_to = u.id
      LEFT JOIN ticket_allocations ta ON ta.ticket_id = t.id
      WHERE t.id = ?
    `, [id]);
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Get replies for this ticket
    const [replies] = await pool.execute(
      'SELECT * FROM replies WHERE ticket_id = ? ORDER BY created_at ASC',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...ticket,
        replies
      }
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
});

// POST /api/tickets - Create new ticket
router.post('/', upload.single('attachment'), handleUploadError, async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('Received ticket data:', req.body);
    
    const { name, email, mobile, product, module, description, issueType, issueTypeOther, issueTitle, userId } = req.body;
    
    // Format all input data using universal text formatter
    const formattedData = TextFormatter.formatTicketData({
      name,
      email,
      mobile,
      product,
      module,
      description,
      issueType,
      issueTypeOther,
      issueTitle
    });
    
    // Find product_id based on product name
    let productId = null;
    let moduleId = null;
    let slaConfiguration = null;
    
    if (product) {
      const [products] = await pool.execute(
        'SELECT id FROM products WHERE name = ? AND status = "active"',
        [product]
      );
      if (products.length > 0) {
        productId = products[0].id;
        console.log(`✅ Found product_id: ${productId} for product: ${product}`);
        
        // Find module_id based on module name
        if (module) {
          const [modules] = await pool.execute(
            'SELECT id FROM modules WHERE product_id = ? AND name = ? AND status = "active"',
            [productId, module]
          );
          if (modules.length > 0) {
            moduleId = modules[0].id;
            console.log(`✅ Found module_id: ${moduleId} for module: ${module}`);
            
            // Find SLA configuration for this module
            const [slaConfigs] = await pool.execute(
              'SELECT * FROM sla_configurations WHERE module_id = ? AND is_active = TRUE ORDER BY priority_level ASC LIMIT 1',
              [moduleId]
            );
            if (slaConfigs.length > 0) {
              slaConfiguration = slaConfigs[0];
              console.log(`✅ Found SLA configuration: ${slaConfiguration.response_time_minutes}min response, ${slaConfiguration.resolution_time_minutes}min resolution`);
            }
          }
        }
      } else {
        console.log(`⚠️ Product not found: ${product}, will use default SLA time`);
      }
    }
    
    // Prepare attachment data
    let attachmentData = null;
    let attachmentName = null;
    let attachmentType = null;
    
    if (req.file) {
      attachmentName = req.file.originalname;
      attachmentType = req.file.mimetype;
      
      // Read file and convert to buffer for database storage
      const fileBuffer = fs.readFileSync(req.file.path);
      attachmentData = fileBuffer;
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);
    }
    
    // Insert ticket into database with formatted data
    const safe = v => v === undefined ? null : v;
    const [result] = await pool.execute(
      `INSERT INTO tickets (user_id, name, email, mobile, product, product_id, module, module_id, description, issue_type, issue_type_other, issue_title, attachment_name, attachment_type, attachment) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safe(userId),
        safe(name),
        safe(email),
        safe(mobile),
        safe(product),
        safe(productId),
        safe(module),
        safe(moduleId),
        safe(description),
        safe(issueType),
        safe(issueTypeOther),
        safe(issueTitle),
        safe(attachmentName),
        safe(attachmentType),
        safe(attachmentData)
      ]
    );
    
    const ticketId = result.insertId;
    
    // 🎯 AUTOMATIC EQUAL TICKET ASSIGNMENT
    let assignmentResult = null;
    try {
      console.log(`🎯 Attempting automatic ticket assignment for ticket ${ticketId}...`);
      assignmentResult = await TicketAssignmentService.assignTicketEqually(ticketId, userId);
      console.log(`✅ Automatic assignment successful: ${assignmentResult.message}`);
    } catch (assignmentError) {
      console.warn(`⚠️ Automatic assignment failed for ticket ${ticketId}:`, assignmentError.message);
      console.log('💡 Ticket will remain unassigned and can be manually assigned later');
    }

    // 🕐 CREATE SLA TIMERS FOR THE TICKET
    if (slaConfiguration) {
      try {
        console.log(`🕐 Creating SLA timers for ticket ${ticketId}...`);
        
        // Create response timer
        const responseDeadline = new Date();
        responseDeadline.setMinutes(responseDeadline.getMinutes() + slaConfiguration.response_time_minutes);
        
        await pool.execute(`
          INSERT INTO sla_timers (ticket_id, sla_configuration_id, timer_type, sla_deadline, status)
          VALUES (?, ?, 'response', ?, 'active')
        `, [ticketId, slaConfiguration.id, responseDeadline]);
        
        // Create resolution timer
        const resolutionDeadline = new Date();
        resolutionDeadline.setMinutes(resolutionDeadline.getMinutes() + slaConfiguration.resolution_time_minutes);
        
        await pool.execute(`
          INSERT INTO sla_timers (ticket_id, sla_configuration_id, timer_type, sla_deadline, status)
          VALUES (?, ?, 'resolution', ?, 'active')
        `, [ticketId, slaConfiguration.id, resolutionDeadline]);
        
        // Create escalation timer if escalation time is configured
        if (slaConfiguration.escalation_time_minutes) {
          const escalationDeadline = new Date();
          escalationDeadline.setMinutes(escalationDeadline.getMinutes() + slaConfiguration.escalation_time_minutes);
          
          await pool.execute(`
            INSERT INTO sla_timers (ticket_id, sla_configuration_id, timer_type, sla_deadline, status)
            VALUES (?, ?, 'escalation', ?, 'active')
          `, [ticketId, slaConfiguration.id, escalationDeadline]);
        }
        
        console.log(`✅ SLA timers created successfully for ticket ${ticketId}`);
        console.log(`   - Response deadline: ${responseDeadline.toLocaleString()}`);
        console.log(`   - Resolution deadline: ${resolutionDeadline.toLocaleString()}`);
        if (slaConfiguration.escalation_time_minutes) {
          console.log(`   - Escalation deadline: ${escalationDeadline.toLocaleString()}`);
        }
        
      } catch (slaError) {
        console.error(`❌ Failed to create SLA timers for ticket ${ticketId}:`, slaError);
        console.log('💡 Ticket created but SLA tracking may not work properly');
      }
    } else {
      console.log(`⚠️ No SLA configuration found for ticket ${ticketId}, using default 8-hour response time`);
      
      // Create default SLA timer with 8-hour response time
      try {
        const defaultDeadline = new Date();
        defaultDeadline.setHours(defaultDeadline.getHours() + 8);
        
        // Create a temporary SLA configuration record for default timing
        const [defaultSlaResult] = await pool.execute(`
          INSERT INTO sla_configurations (product_id, module_id, issue_name, response_time_minutes, resolution_time_minutes, priority_level, is_active)
          VALUES (?, ?, ?, 480, 1440, 'P2', TRUE)
        `, [productId || 1, moduleId || 1, issueType || 'default']);
        
        const defaultSlaId = defaultSlaResult.insertId;
        
        await pool.execute(`
          INSERT INTO sla_timers (ticket_id, sla_configuration_id, timer_type, sla_deadline, status)
          VALUES (?, ?, 'response', ?, 'active')
        `, [ticketId, defaultSlaId, defaultDeadline]);
        
        console.log(`✅ Default SLA timer created for ticket ${ticketId} with 8-hour deadline`);
        
      } catch (defaultSlaError) {
        console.error(`❌ Failed to create default SLA timer for ticket ${ticketId}:`, defaultSlaError);
      }
    }
    
    const ticketData = {
      id: ticketId,
      name,
      email,
      mobile,
      product,
      product_id: productId,
      module,
      module_id: moduleId,
      description,
      issueType,
      issueTypeOther,
      issueTitle,
      status: 'new',
      assignment: assignmentResult ? {
        assigned_to: assignmentResult.data.assigned_to,
        assigned_to_name: assignmentResult.data.assigned_to_name,
        assignment_method: assignmentResult.data.assignment_method
      } : null
    };

    res.status(201).json({
      success: true,
      message: assignmentResult ? 
        `Ticket created successfully and assigned to ${assignmentResult.data.assigned_to_name}` : 
        'Ticket created successfully (assignment pending)',
      data: ticketData
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
});

// PUT /api/tickets/:id/status - Update ticket status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'in_progress', 'closed', 'escalated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be new, in_progress, closed, or escalated'
      });
    }
    
    // Get ticket data
    const [tickets] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Prepare update query with timestamp tracking
    let updateQuery = 'UPDATE tickets SET status = ?';
    let queryParams = [status];
    
    // Record first response time when status changes to 'in_progress'
    if (status === 'in_progress' && ticket.status !== 'in_progress' && !ticket.first_response_at) {
      updateQuery += ', first_response_at = ?';
      queryParams.push(new Date());
      console.log(`📝 Recording first response time for ticket ${id}: ${new Date().toISOString()}`);
    }
    
    // Record resolution time when status changes to 'closed'
    if (status === 'closed' && ticket.status !== 'closed' && !ticket.resolved_at) {
      updateQuery += ', resolved_at = ?';
      queryParams.push(new Date());
      console.log(`📝 Recording resolution time for ticket ${id}: ${new Date().toISOString()}`);
    }
    
    queryParams.push(id);
    updateQuery += ' WHERE id = ?';
    
    const [result] = await pool.execute(updateQuery, queryParams);
    
    // Send WhatsApp notification for status update
    if (ticket.mobile) {
      const { sendStatusUpdateNotification } = require('../utils/whatsapp-notifications');
      await sendStatusUpdateNotification(ticket, status);
    }
    
    console.log(`✅ Status updated for ticket ${id}: ${status}`);
    console.log(`📝 Timestamps: first_response_at=${queryParams.includes('first_response_at') ? 'SET' : 'NOT SET'}, resolved_at=${queryParams.includes('resolved_at') ? 'SET' : 'NOT SET'}`);
    
    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      whatsappSent: !!ticket.mobile
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// PUT /api/tickets/:id - Update a ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, product, description, issue_type, issue_type_other, issue_title, status } = req.body;
    
    // Check if ticket exists
    const [tickets] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Find product_id if product name is provided
    let productId = ticket.product_id; // Keep existing product_id if no new product
    if (product && product !== ticket.product) {
      const [products] = await pool.execute(
        'SELECT id FROM products WHERE name = ? AND status = "active"',
        [product]
      );
      if (products.length > 0) {
        productId = products[0].id;
      }
    }
    
    // Update the ticket
    const [result] = await pool.execute(
      `UPDATE tickets SET 
        name = ?, email = ?, mobile = ?, product = ?, product_id = ?, 
        description = ?, issue_type = ?, issue_type_other = ?, issue_title = ?, 
        status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name || ticket.name,
        email || ticket.email,
        mobile || ticket.mobile,
        product || ticket.product,
        productId,
        description || ticket.description,
        issue_type || ticket.issue_type,
        issue_type_other || ticket.issue_type_other,
        issue_title || ticket.issue_title,
        status || ticket.status,
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Send WhatsApp notification if mobile number exists and status changed
    if (ticket.mobile && status && status !== ticket.status) {
      const statusEmoji = {
        'new': '🆕',
        'in_progress': '⚡',
        'closed': '✅',
        'escalated': '🚨'
      };
      
      const statusText = {
        'new': 'New',
        'in_progress': 'In Progress',
        'closed': 'Resolved',
        'escalated': 'Escalated'
      };
      
      const whatsappMessage = `📋 Ticket Updated\n\n` +
        `🎫 Ticket ID: #${ticket.id}\n` +
        `🏷️ Issue: ${issue_title || ticket.issue_title}\n` +
        `📊 Status: ${statusEmoji[status]} ${statusText[status]}\n\n` +
        `Your ticket has been updated. We'll keep you informed of any progress!`;
      
      await sendWhatsAppMessage(ticket.mobile, whatsappMessage);
    }
    
    res.json({
      success: true,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
});

// GET /api/tickets/:id/attachment - Get ticket attachment
router.get('/:id/attachment', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Attachment] Request for ticket ID: ${id}`);
    const [tickets] = await pool.execute(
      'SELECT attachment_name, attachment_type, attachment FROM tickets WHERE id = ?',
      [id]
    );
    if (tickets.length === 0) {
      console.log(`[Attachment] Ticket not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    if (!tickets[0].attachment) {
      console.log(`[Attachment] No attachment for ticket ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    const ticket = tickets[0];
    // Ensure attachment is a Buffer
    if (!(ticket.attachment instanceof Buffer)) {
      console.log(`[Attachment] Attachment is not a Buffer for ticket ID: ${id}`);
      return res.status(500).json({
        success: false,
        message: 'Attachment is not a valid file'
      });
    }
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition,Content-Type');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000");
    res.setHeader('Content-Type', ticket.attachment_type);
    res.setHeader('Content-Disposition', `inline; filename=\"${ticket.attachment_name}\"`);
    res.setHeader('Permissions-Policy', 'fullscreen=(self http://localhost:3000)');
    res.send(ticket.attachment);
  } catch (error) {
    console.error('Error fetching attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attachment'
    });
  }
});

// GET /api/tickets/user/:userId - Get all tickets for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if userId is actually an email
    if (userId.includes('@')) {
      // If userId is an email, get tickets directly by email
      const [tickets] = await pool.execute(
        `SELECT * FROM tickets WHERE email = ? ORDER BY created_at DESC`,
        [userId]
      );
      
      return res.json({ success: true, data: tickets });
    }
    
    // Try to find user in both agents and users tables
    let [agents] = await pool.execute('SELECT email FROM agents WHERE id = ?', [userId]);
    let [users] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
    
    let userEmail = null;
    
    if (agents.length > 0) {
      userEmail = agents[0].email;
    } else if (users.length > 0) {
      userEmail = users[0].email;
    }
    
    if (!userEmail) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get tickets that belong to this user (by user_id OR by email)
    const [tickets] = await pool.execute(
      `SELECT * FROM tickets WHERE user_id = ? OR email = ? ORDER BY created_at DESC`,
      [userId, userEmail]
    );
    
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user tickets' });
  }
});

// DELETE /api/tickets/:id - Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const [tickets] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Delete the ticket
    const [result] = await pool.execute(
      'DELETE FROM tickets WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Send WhatsApp notification if mobile number exists
    if (ticket.mobile) {
      const whatsappMessage = `📋 Ticket Deleted\n\n` +
        `🎫 Ticket ID: #${ticket.id}\n` +
        `🏷️ Issue: ${ticket.issue_title}\n` +
        `❌ Status: Deleted\n\n` +
        `Your ticket has been deleted from our system.`;
      
      await sendWhatsAppMessage(ticket.mobile, whatsappMessage);
    }
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket'
    });
  }
});

// GET /api/tickets/assignment-stats - Get ticket assignment statistics
router.get('/assignment-stats', async (req, res) => {
  try {
    const stats = await TicketAssignmentService.getAssignmentStatistics();
    
    res.json({
      success: true,
      message: 'Assignment statistics retrieved successfully',
      data: {
        agents: stats,
        total_agents: stats.length,
        total_tickets: stats.reduce((sum, agent) => sum + agent.total_tickets, 0),
        average_tickets_per_agent: stats.length > 0 ? 
          (stats.reduce((sum, agent) => sum + agent.total_tickets, 0) / stats.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error getting assignment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignment statistics'
    });
  }
});

// POST /api/tickets/rebalance - Rebalance ticket assignments
router.post('/rebalance', async (req, res) => {
  try {
    const result = await TicketAssignmentService.rebalanceAssignments();
    
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Error rebalancing assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rebalance assignments'
    });
  }
});

// POST /api/tickets/:id/assign-equally - Manually assign a ticket using equal distribution
router.post('/:id/assign-equally', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_by } = req.body;
    
    const result = await TicketAssignmentService.assignTicketEqually(parseInt(id), assigned_by);
    
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Error assigning ticket equally:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign ticket'
    });
  }
});

// Add a new route for testing timestamp recording
router.put('/:id/status-test', async (req, res) => {
  try {
    console.log('🔍 TEST ROUTE: /api/tickets/:id/status-test called');
    const { id } = req.params;
    const { status } = req.body;
    
    // Get current ticket status
    const [tickets] = await pool.execute(
      'SELECT status, first_response_at, resolved_at FROM tickets WHERE id = ?',
      [id]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    const ticket = tickets[0];
    const now = new Date();
    
    // Prepare update query with timestamp tracking
    let updateQuery = 'UPDATE tickets SET status = ?';
    let queryParams = [status];
    
    // Record first response time when status changes to 'in_progress'
    if (status === 'in_progress' && ticket.status !== 'in_progress' && !ticket.first_response_at) {
      updateQuery += ', first_response_at = ?';
      queryParams.push(now);
      console.log(`📝 Recording first response time for ticket ${id}: ${now.toISOString()}`);
    }
    
    // Record resolution time when status changes to 'closed'
    if (status === 'closed' && ticket.status !== 'closed' && !ticket.resolved_at) {
      updateQuery += ', resolved_at = ?';
      queryParams.push(now);
      console.log(`📝 Recording resolution time for ticket ${id}: ${now.toISOString()}`);
    }
    
    queryParams.push(id);
    updateQuery += ' WHERE id = ?';
    
    const [result] = await pool.execute(updateQuery, queryParams);
    
    console.log(`✅ TEST ROUTE: Status updated for ticket ${id}: ${status}`);
    
    res.json({
      success: true,
      message: 'Ticket status updated successfully (test route)'
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status'
    });
  }
});

// GET /api/tickets/agent/:agentId - Get tickets assigned to a specific agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    console.log(`🔍 Fetching tickets for agent ID: ${agentId}`);
    
    // Validate agent ID
    if (!agentId || isNaN(parseInt(agentId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }
    
    // Get tickets assigned to this agent
    const [tickets] = await pool.execute(`
      SELECT 
        t.id,
        t.name,
        t.email,
        t.mobile,
        t.product,
        t.product_id,
        t.module,
        t.module_id,
        t.description,
        t.issue_type,
        t.issue_type_other,
        t.issue_title,
        t.status,
        t.priority,
        t.assigned_to,
        t.assigned_by,
        t.created_at,
        t.updated_at,
        t.first_response_at,
        t.resolved_at,
        t.attachment_name,
        t.attachment_type,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM tickets t
      LEFT JOIN agents a ON t.assigned_to = a.id
      WHERE t.assigned_to = ?
      ORDER BY t.created_at DESC
    `, [parseInt(agentId)]);
    
    console.log(`✅ Found ${tickets.length} tickets for agent ${agentId}`);
    
    res.json({
      success: true,
      message: `Found ${tickets.length} tickets for agent`,
      data: tickets
    });
    
  } catch (error) {
    console.error('Error fetching agent tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent tickets'
    });
  }
});

module.exports = router;