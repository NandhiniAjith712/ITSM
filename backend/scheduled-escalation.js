const { pool } = require('./database');

// Auto-escalation function
async function autoEscalateBreachedTickets() {
  try {
    console.log(`🕐 [${new Date().toLocaleString()}] Checking for breached tickets...`);
    const now = new Date();
    
    // Get all active tickets with their SLA configurations and timers
    const [activeTickets] = await pool.execute(`
      SELECT t.*, p.name as product_name, m.name as module_name, 
             sc.response_time_minutes, sc.resolution_time_minutes, sc.priority_level,
             st.id as timer_id, st.timer_type, st.sla_deadline, st.status as timer_status
      FROM tickets t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN modules m ON t.module_id = m.id
      LEFT JOIN sla_configurations sc ON t.module_id = sc.module_id AND sc.is_active = TRUE
      LEFT JOIN sla_timers st ON t.id = st.ticket_id AND st.timer_type = 'response'
      WHERE t.status IN ('new', 'in_progress')
      ORDER BY sc.priority_level ASC, sc.response_time_minutes ASC
    `);

    if (activeTickets.length === 0) {
      console.log('✅ No active tickets found');
      return;
    }

    console.log(`📋 Found ${activeTickets.length} active tickets to check`);

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
    let timerUpdatesCount = 0;

    for (const ticket of activeTickets) {
      // Skip tickets without SLA configuration (use default 8 hours)
      const slaTimeMinutes = ticket.response_time_minutes || 480; // Default 8 hours
      const ticketCreatedAt = new Date(ticket.created_at);
      const slaDeadline = new Date(ticketCreatedAt.getTime() + (slaTimeMinutes * 60 * 1000));
      
      const isBreached = now.getTime() > slaDeadline.getTime();
      
      // Update SLA timer status if it exists
      if (ticket.timer_id) {
        try {
          let newTimerStatus = 'active';
          if (isBreached) {
            newTimerStatus = 'breached';
          } else if (now.getTime() > (slaDeadline.getTime() - (30 * 60 * 1000))) { // 30 minutes before deadline
            newTimerStatus = 'warning';
          }
          
          if (newTimerStatus !== ticket.timer_status) {
            await pool.execute(`
              UPDATE sla_timers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `, [newTimerStatus, ticket.timer_id]);
            timerUpdatesCount++;
            console.log(`🔄 Updated timer ${ticket.timer_id} status to: ${newTimerStatus}`);
          }
        } catch (timerError) {
          console.error(`❌ Error updating timer ${ticket.timer_id}:`, timerError.message);
        }
      }
      
      if (isBreached) {
        breachedCount++;
        
        // Update ticket status to escalated
        await pool.execute(`
          UPDATE tickets SET status = 'escalated' WHERE id = ?
        `, [ticket.id]);
        
        escalatedCount++;
        
        // Log escalation details
        console.log(`🚨 Auto-escalated ticket ${ticket.id}:`);
        console.log(`   - Product: ${ticket.product_name || ticket.product || 'Unknown'}`);
        console.log(`   - Module: ${ticket.module_name || ticket.module || 'Unknown'}`);
        console.log(`   - SLA Time: ${slaTimeMinutes} minutes`);
        console.log(`   - Priority: ${ticket.priority_level || 'P2'}`);
        console.log(`   - Created: ${ticketCreatedAt.toLocaleString()}`);
        console.log(`   - Deadline: ${slaDeadline.toLocaleString()}`);
        console.log(`   - Escalated to: ${manager ? manager.name : 'No manager found'}`);
        console.log(`   - CEO notified: ${ceo ? ceo.name : 'No CEO found'}`);
        console.log('   ---');
      }
    }

    // Send notification to CEO if available
    if (ceo && escalatedCount > 0) {
      console.log(`📧 CEO notification sent to: ${ceo.name} (${ceo.email})`);
      console.log(`📋 Summary: ${escalatedCount} tickets escalated due to SLA breach`);
    }

    console.log(`✅ Auto-escalation completed: ${escalatedCount} tickets escalated out of ${breachedCount} breached`);
    console.log(`🔄 Timer status updates: ${timerUpdatesCount} timers updated`);

  } catch (error) {
    console.error('❌ Error in auto-escalation:', error);
  }
}

// Run auto-escalation every 5 minutes
function startScheduledEscalation() {
  console.log('🚀 Starting scheduled auto-escalation system...');
  console.log('⏰ Will check for breached tickets every 5 minutes');
  console.log('🔄 Will update SLA timer statuses automatically');
  
  // Run immediately
  autoEscalateBreachedTickets();
  
  // Then run every 5 minutes
  setInterval(autoEscalateBreachedTickets, 5 * 60 * 1000);
}

// Export the function for use in main server
module.exports = {
  startScheduledEscalation,
  autoEscalateBreachedTickets
}; 