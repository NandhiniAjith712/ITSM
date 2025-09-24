const express = require('express');
const { pool } = require('../../database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');
const { sendAssignmentNotification } = require('../../utils/whatsapp-notifications');

const router = express.Router();

// GET /api/assignments - Get all assignments with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, agent_id, ticket_id, limit = 50, offset = 0 } = req.query;
    
    // Validate and sanitize pagination parameters
    const validLimit = Math.max(1, Math.min(1000, parseInt(limit) || 50));
    const validOffset = Math.max(0, parseInt(offset) || 0);
    
    // Try a simpler query first to test the view
    let query = `
      SELECT 
        ca.assignment_id,
        ca.ticket_id,
        ca.agent_id,
        ca.agent_name,
        ca.agent_email,
        ca.agent_role,
        ca.assigned_by,
        ca.assigned_by_name,
        ca.assigned_at,
        ca.assignment_type,
        ca.priority_level,
        ca.assignment_notes,
        ca.is_primary,
        ca.ticket_status,
        ca.issue_title,
        ca.ticket_created
      FROM current_assignments ca
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND ca.ticket_status = ?';
      params.push(status);
    }
    
    if (agent_id) {
      query += ' AND ca.agent_id = ?';
      params.push(agent_id);
    }
    
    if (ticket_id) {
      query += ' AND ca.ticket_id = ?';
      params.push(ticket_id);
    }
    
    query += ' ORDER BY ca.assigned_at DESC LIMIT ? OFFSET ?';
    
    // Ensure parameters are strings (MySQL2 requires strings for LIMIT/OFFSET)
    const finalParams = [...params, String(validLimit), String(validOffset)];
    
    const [assignments] = await pool.execute(query, finalParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM current_assignments ca WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND ca.ticket_status = ?';
      countParams.push(status);
    }
    
    if (agent_id) {
      countQuery += ' AND ca.agent_id = ?';
      countParams.push(agent_id);
    }
    
    if (ticket_id) {
      countQuery += ' AND ca.ticket_id = ?';
      countParams.push(ticket_id);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    
    res.json({
      success: true,
      data: assignments,
      pagination: {
        total: countResult[0].total,
        limit: Number(validLimit),
        offset: Number(validOffset),
        hasMore: (Number(validOffset) + assignments.length) < countResult[0].total
      }
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

// GET /api/assignments/history/:ticketId - Get assignment history for a ticket
router.get('/history/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const [history] = await pool.execute(`
      SELECT 
        ah.assignment_id,
        ah.ticket_id,
        ah.agent_id,
        ah.agent_name,
        ah.assigned_by,
        ah.assigned_by_name,
        ah.assigned_at,
        ah.unassigned_at,
        ah.status,
        ah.assignment_type,
        ah.assignment_notes,
        ah.duration_minutes,
        ah.issue_title,
        ah.ticket_status
      FROM assignment_history ah
      WHERE ah.ticket_id = ?
      ORDER BY ah.assigned_at DESC
    `, [ticketId]);
    
    res.json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment history',
      error: error.message
    });
  }
});

// GET /api/assignments/workload - Get agent workload statistics
router.get('/workload', authenticateToken, authorizeRole(['support_manager', 'ceo']), async (req, res) => {
  try {
    const [workload] = await pool.execute(`
      SELECT 
        aw.agent_id,
        aw.agent_name,
        aw.agent_email,
        aw.agent_role,
        aw.total_active_assignments,
        aw.primary_assignments,
        aw.urgent_tickets,
        aw.high_priority_tickets,
        aw.avg_workload_score,
        aw.oldest_assignment,
        aw.newest_assignment
      FROM agent_workload aw
      ORDER BY aw.total_active_assignments DESC, aw.agent_name
    `);
    
    res.json({
      success: true,
      data: workload
    });
    
  } catch (error) {
    console.error('Error fetching agent workload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent workload',
      error: error.message
    });
  }
});

// POST /api/assignments/assign - Assign a ticket to an agent
router.post('/assign', authenticateToken, authorizeRole(['support_manager', 'ceo', 'support_executive']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { ticket_id, agent_id, assignment_type = 'manual', priority_level = 'medium', notes } = req.body;
    const assigned_by = req.user.id;
    
    if (!ticket_id || !agent_id) {
      return res.status(400).json({
        success: false,
        message: 'ticket_id and agent_id are required'
      });
    }
    
    await connection.beginTransaction();
    
    // Calculate current workload for the agent
    const [workloadResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM ticket_assignments WHERE agent_id = ? AND is_active = TRUE',
      [agent_id]
    );
    const workloadScore = workloadResult[0].count;
    
    // Mark any existing assignment as inactive
    await connection.execute(`
      UPDATE ticket_assignments 
      SET is_active = FALSE, unassigned_at = NOW() 
      WHERE ticket_id = ? AND is_active = TRUE
    `, [ticket_id]);
    
    // Create new assignment
    const [assignmentResult] = await connection.execute(`
      INSERT INTO ticket_assignments (
        ticket_id, agent_id, assigned_by, assignment_reason, is_active
      ) VALUES (?, ?, ?, ?, TRUE)
    `, [ticket_id, agent_id, assigned_by, notes]);
    
    // Update tickets table for backward compatibility
    await connection.execute(`
      UPDATE tickets 
      SET assigned_to = ?, assigned_by = ? 
      WHERE id = ?
    `, [agent_id, assigned_by, ticket_id]);
    
    await connection.commit();
    
    // Get the created assignment details
    const [newAssignment] = await connection.execute(`
      SELECT 
        ca.assignment_id,
        ca.ticket_id,
        ca.agent_id,
        ca.agent_name,
        ca.agent_email,
        ca.assigned_by,
        ca.assigned_by_name,
        ca.assigned_at,
        ca.assignment_type,
        ca.priority_level,
        ca.assignment_notes,
        ca.is_primary,
        ca.ticket_status,
        ca.issue_title
      FROM current_assignments ca
      WHERE ca.assignment_id = ?
    `, [assignmentResult.insertId]);
    
    // Send WhatsApp notification to customer about ticket assignment
    try {
      const [ticketDetails] = await connection.execute(
        'SELECT id, name, mobile, issue_title FROM tickets WHERE id = ?',
        [ticket_id]
      );
      
      if (ticketDetails.length > 0 && ticketDetails[0].mobile) {
        const ticket = ticketDetails[0];
        const agentName = newAssignment[0].agent_name;
        
        await sendAssignmentNotification(ticket, agentName);
        console.log(`✅ WhatsApp assignment notification sent to ${ticket.mobile}`);
      }
    } catch (notificationError) {
      console.error('⚠️ Error sending WhatsApp notification:', notificationError);
      // Don't fail the assignment if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: newAssignment[0],
      whatsappNotificationSent: true
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// PUT /api/assignments/:id/transfer - Transfer assignment to another agent
router.put('/:id/transfer', authenticateToken, authorizeRole(['support_manager', 'ceo']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id: assignmentId } = req.params;
    const { new_agent_id, notes } = req.body;
    const transferred_by = req.user.id;
    
    if (!new_agent_id) {
      return res.status(400).json({
        success: false,
        message: 'new_agent_id is required'
      });
    }
    
    await connection.beginTransaction();
    
    // Get current assignment details
    const [currentAssignment] = await connection.execute(
      'SELECT ticket_id, agent_id FROM ticket_assignments WHERE id = ? AND is_active = TRUE',
      [assignmentId]
    );
    
    if (currentAssignment.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not active'
      });
    }
    
    const { ticket_id } = currentAssignment[0];
    
    // Mark current assignment as inactive
    await connection.execute(`
      UPDATE ticket_assignments 
      SET is_active = FALSE, unassigned_at = NOW() 
      WHERE id = ?
    `, [assignmentId]);
    
    // Calculate workload for new agent
    const [workloadResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM ticket_assignments WHERE agent_id = ? AND is_active = TRUE',
      [new_agent_id]
    );
    const workloadScore = workloadResult[0].count;
    
    // Create new assignment
    const [newAssignmentResult] = await connection.execute(`
      INSERT INTO ticket_assignments (
        ticket_id, agent_id, assigned_by, assignment_reason, is_active
      ) VALUES (?, ?, ?, ?, TRUE)
    `, [ticket_id, new_agent_id, transferred_by, notes]);
    
    // Update tickets table
    await connection.execute(`
      UPDATE tickets 
      SET assigned_to = ?, assigned_by = ? 
      WHERE id = ?
    `, [new_agent_id, transferred_by, ticket_id]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Assignment transferred successfully',
      data: {
        old_assignment_id: assignmentId,
        new_assignment_id: newAssignmentResult.insertId,
        ticket_id,
        new_agent_id
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error transferring assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer assignment',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// PUT /api/assignments/:id/complete - Mark assignment as completed
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { completion_notes } = req.body;
    
    const [result] = await pool.execute(`
      UPDATE ticket_assignments 
      SET is_active = FALSE, unassigned_at = NOW(), assignment_reason = CONCAT(COALESCE(assignment_reason, ''), '\n\nCompleted: ', ?)
      WHERE id = ? AND is_active = TRUE
    `, [completion_notes || 'Assignment completed', assignmentId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or already completed'
      });
    }
    
    res.json({
      success: true,
      message: 'Assignment marked as completed'
    });
    
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete assignment',
      error: error.message
    });
  }
});

module.exports = router;
