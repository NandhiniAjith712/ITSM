const { pool } = require('../database');

/**
 * Equal Ticket Assignment System
 * 
 * This system ensures that tickets are distributed equally among all active agents.
 * When a new ticket is created, it's automatically assigned to the agent with the least number of active tickets.
 * This ensures fair workload distribution and scales automatically when new agents are added.
 * 
 * UPDATED: Now uses the new assigned table for proper assignment tracking and consistency
 */

class TicketAssignmentService {
  
  /**
   * Get the single support executive for ticket assignment
   * @returns {Promise<Object|null>} Agent object or null if no agent found
   */
  static async getAgentWithLeastTickets() {
    const connection = await pool.getConnection();
    
    try {
      // Find the active agent with the least number of active tickets using the new assigned table
      console.log('🎯 Selecting active agent with the fewest active tickets...');

      const [agents] = await connection.execute(`
        SELECT 
          a.id,
          a.name,
          a.email,
          a.role,
          a.is_active,
          COALESCE(assignment_counts.active_tickets, 0) as active_tickets
        FROM agents a
        LEFT JOIN (
          SELECT 
            agent_id,
            COUNT(*) as active_tickets
          FROM assigned 
          WHERE status = 'active' AND is_primary = TRUE
          GROUP BY agent_id
        ) assignment_counts ON a.id = assignment_counts.agent_id
        WHERE a.is_active = TRUE 
          AND a.role IN ('support_executive')
        ORDER BY active_tickets ASC, a.id ASC
        LIMIT 1
      `);

      if (agents.length === 0) {
        console.log('⚠️ No active agents found (role = agent or support_executive).');
        return null;
      }

      const selectedAgent = agents[0];
      console.log(`🎯 Selected agent: ${selectedAgent.name} (ID: ${selectedAgent.id}) with ${selectedAgent.active_tickets} active tickets`);

      return selectedAgent;
      
    } catch (error) {
      console.error('❌ Error getting agent with least tickets:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Assign a ticket to an agent using equal distribution
   * @param {number} ticketId - The ticket ID to assign
   * @param {number} assignedBy - The ID of the user/agent making the assignment
   * @returns {Promise<Object>} Assignment result
   */
  static async assignTicketEqually(ticketId, assignedBy = null) {
    const connection = await pool.getConnection();
    
    try {
      // Get the agent with the least tickets
      const agent = await this.getAgentWithLeastTickets();
      
      if (!agent) {
        throw new Error('No active agents available for ticket assignment');
      }
      
      // Update the ticket with the selected agent (for backward compatibility)
      const [result] = await connection.execute(
        'UPDATE tickets SET assigned_to = ?, assigned_by = ? WHERE id = ?',
        [agent.id, assignedBy, ticketId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Ticket not found or already assigned');
      }
      
      // Create assignment record in the new assigned table
      await connection.execute(
        `INSERT INTO assigned (
          ticket_id, agent_id, assigned_by, assignment_type, 
          priority_level, assignment_notes, workload_score, 
          is_primary, status
        ) VALUES (?, ?, ?, 'auto', 'medium', 'Automatic equal distribution assignment', ?, TRUE, 'active')`,
        [ticketId, agent.id, assignedBy || agent.id, agent.active_tickets + 1]
      );
      
      console.log(`✅ Ticket ${ticketId} assigned to ${agent.name} (ID: ${agent.id}) using equal distribution`);
      
      return {
        success: true,
        message: `Ticket assigned to ${agent.name} using equal distribution`,
        data: {
          ticket_id: ticketId,
          assigned_to: agent.id,
          assigned_to_name: agent.name,
          assigned_to_email: agent.email,
          assignment_method: 'equal_distribution',
          active_tickets_count: agent.active_tickets + 1
        }
      };
      
    } catch (error) {
      console.error('❌ Error assigning ticket equally:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Get assignment statistics for the single support executive
   * @returns {Promise<Array>} Array with single agent and their ticket counts
   */
  static async getAssignmentStatistics() {
    const connection = await pool.getConnection();
    
    try {
      // Get stats for all active agents
      const [agents] = await connection.execute(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.is_active,
          COALESCE(new_tickets.count, 0) as new_tickets,
          COALESCE(in_progress_tickets.count, 0) as in_progress_tickets,
          COALESCE(closed_tickets.count, 0) as closed_tickets,
          COALESCE(total_tickets.count, 0) as total_tickets
        FROM agents u
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as count
          FROM tickets 
          WHERE status = 'new' AND assigned_to IS NOT NULL
          GROUP BY assigned_to
        ) new_tickets ON u.id = new_tickets.assigned_to
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as count
          FROM tickets 
          WHERE status = 'in_progress' AND assigned_to IS NOT NULL
          GROUP BY assigned_to
        ) in_progress_tickets ON u.id = in_progress_tickets.assigned_to
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as count
          FROM tickets 
          WHERE status = 'closed' AND assigned_to IS NOT NULL
          GROUP BY assigned_to
        ) closed_tickets ON u.id = closed_tickets.assigned_to
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as count
          FROM tickets 
          WHERE assigned_to IS NOT NULL
          GROUP BY assigned_to
        ) total_tickets ON u.id = total_tickets.assigned_to
        WHERE u.is_active = TRUE AND u.role IN ('support_executive')
        ORDER BY total_tickets.count DESC, u.name ASC
      `);
      
      return agents;
      
    } catch (error) {
      console.error('❌ Error getting assignment statistics:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Rebalance ticket assignments to ensure equal distribution
   * @returns {Promise<Object>} Rebalancing result
   */
  static async rebalanceAssignments() {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔄 Starting ticket assignment rebalancing...');
      
      // Get all unassigned tickets (not in assigned table or no active assignment)
      const [unassignedTickets] = await connection.execute(`
        SELECT t.id, t.name, t.email, t.created_at 
        FROM tickets t
        LEFT JOIN assigned a ON t.id = a.ticket_id AND a.status = 'active' AND a.is_primary = TRUE
        WHERE a.id IS NULL AND t.status IN ('new', 'in_progress')
        ORDER BY t.created_at ASC
      `);
      
      if (unassignedTickets.length === 0) {
        console.log('✅ No unassigned tickets found');
        return {
          success: true,
          message: 'No unassigned tickets to rebalance',
          data: { rebalanced_tickets: 0 }
        };
      }
      
      console.log(`📋 Found ${unassignedTickets.length} unassigned tickets to rebalance`);
      
      let rebalancedCount = 0;
      
      for (const ticket of unassignedTickets) {
        try {
          await this.assignTicketEqually(ticket.id);
          rebalancedCount++;
        } catch (error) {
          console.error(`❌ Failed to rebalance ticket ${ticket.id}:`, error.message);
        }
      }
      
      console.log(`✅ Rebalancing completed: ${rebalancedCount} tickets reassigned`);
      
      return {
        success: true,
        message: `Rebalancing completed: ${rebalancedCount} tickets reassigned`,
        data: {
          rebalanced_tickets: rebalancedCount,
          total_unassigned: unassignedTickets.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error rebalancing assignments:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = TicketAssignmentService;
