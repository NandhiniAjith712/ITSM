const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');
const TextFormatter = require('../../utils/textFormatter');
const { sendAgentReplyNotification } = require('../../utils/whatsapp-notifications');

const router = express.Router();



// GET /api/replies/:ticketId - Get all replies for a ticket
router.get('/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Check if ticket exists
    const [tickets] = await pool.execute(
      'SELECT id FROM tickets WHERE id = ?',
      [ticketId]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Get replies for this ticket
    const [replies] = await pool.execute(
      'SELECT * FROM replies WHERE ticket_id = ? ORDER BY sent_at ASC',
      [ticketId]
    );
    
    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies'
    });
  }
});

// POST /api/replies - Add a reply to a ticket
router.post('/', async (req, res) => {
  try {
    
    const { ticketId, agentName, message, isCustomerReply = false, customerName } = req.body;
    
    // Check if ticket exists and get ticket details
    const [tickets] = await pool.execute(
      'SELECT id, name, mobile, issue_title FROM tickets WHERE id = ?',
      [ticketId]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Insert reply - handle both agent and customer replies
    let replyData;
    if (isCustomerReply) {
      // Customer reply
      const [result] = await pool.execute(
        'INSERT INTO replies (ticket_id, customer_name, message, is_customer_reply) VALUES (?, ?, ?, TRUE)',
        [ticketId, customerName || ticket.name, message]
      );
      
      const [replies] = await pool.execute(
        'SELECT * FROM replies WHERE id = ?',
        [result.insertId]
      );
      
      replyData = replies[0];
    } else {
      // Agent reply
      const [result] = await pool.execute(
        'INSERT INTO replies (ticket_id, agent_name, message, is_customer_reply) VALUES (?, ?, ?, FALSE)',
        [ticketId, agentName, message]
      );
      
      const [replies] = await pool.execute(
        'SELECT * FROM replies WHERE id = ?',
        [result.insertId]
      );
      
      replyData = replies[0];
      
      // Send WhatsApp notification if mobile number exists (only for agent replies)
      if (ticket.mobile) {
        await sendAgentReplyNotification(ticket, agentName, message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: isCustomerReply ? 'Customer reply added successfully' : 'Reply added successfully',
      data: replyData,
      whatsappSent: !isCustomerReply && !!ticket.mobile
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
});

// PUT /api/replies/:id - Update a reply
router.put('/:id', async (req, res) => {
  try {
    
    const { id } = req.params;
    const { agentName, message } = req.body;
    
    // Check if reply exists
    const [replies] = await pool.execute(
      'SELECT id FROM replies WHERE id = ?',
      [id]
    );
    
    if (replies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Update reply
    await pool.execute(
      'UPDATE replies SET agent_name = ?, message = ? WHERE id = ?',
      [agentName, message, id]
    );
    
    // Get the updated reply
    const [updatedReplies] = await pool.execute(
      'SELECT * FROM replies WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Reply updated successfully',
      data: updatedReplies[0]
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reply'
    });
  }
});

// DELETE /api/replies/:id - Delete a reply
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if reply exists
    const [replies] = await pool.execute(
      'SELECT id FROM replies WHERE id = ?',
      [id]
    );
    
    if (replies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Delete reply
    await pool.execute(
      'DELETE FROM replies WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reply'
    });
  }
});

// GET /api/replies/user/:userId - Get all replies for all tickets of a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [replies] = await pool.execute(
      `SELECT r.* FROM replies r JOIN tickets t ON r.ticket_id = t.id WHERE t.user_id = ? ORDER BY r.sent_at ASC`,
      [userId]
    );
    res.json({ success: true, data: replies });
  } catch (error) {
    console.error('Error fetching user replies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user replies' });
  }
});

module.exports = router; 