const { pool } = require('./database');

async function enhanceChatDatabase() {
  try {
    console.log('🔄 Enhancing database for chat functionality...');
    
    // First, let's update the existing replies table to support chat messages better
    console.log('📝 Updating replies table...');
    
    // Add new columns to replies table if they don't exist
    const repliesColumns = [
      'agent_name VARCHAR(100) NULL',
      'customer_name VARCHAR(100) NULL', 
      'is_customer_reply BOOLEAN DEFAULT FALSE',
      'message_type ENUM("text", "system", "status_update") DEFAULT "text"',
      'sent_at DATETIME DEFAULT CURRENT_TIMESTAMP',
      'read_at DATETIME NULL',
      'is_edited BOOLEAN DEFAULT FALSE',
      'edited_at DATETIME NULL',
      'parent_message_id INT NULL'
    ];
    
    for (const column of repliesColumns) {
      const columnParts = column.split(' ');
      const columnName = columnParts[0];
      const columnDefinition = columnParts.slice(1).join(' ');
      
      try {
        await pool.execute(`ALTER TABLE replies ADD COLUMN ${columnName} ${columnDefinition}`);
        console.log(`✅ Added column: ${columnName}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️ Column already exists: ${columnName}`);
        } else {
          console.error(`❌ Error adding column ${columnName}:`, error.message);
        }
      }
    }
    
    // Create a dedicated chat_messages table for better chat functionality
    console.log('💬 Creating chat_messages table...');
    await pool.execute(`
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
    console.log('🔗 Creating chat_sessions table...');
    await pool.execute(`
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
    console.log('👥 Creating chat_participants table...');
    await pool.execute(`
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
    
    // Migrate existing replies to chat_messages if needed
    console.log('🔄 Migrating existing replies to chat_messages...');
    const [existingReplies] = await pool.execute(`
      SELECT r.*, t.name as ticket_customer_name 
      FROM replies r 
      JOIN tickets t ON r.ticket_id = t.id 
      WHERE r.id NOT IN (SELECT DISTINCT parent_message_id FROM chat_messages WHERE parent_message_id IS NOT NULL)
    `);
    
    for (const reply of existingReplies) {
      try {
        await pool.execute(`
          INSERT INTO chat_messages (
            ticket_id, 
            sender_type, 
            sender_id, 
            sender_name, 
            message, 
            message_type,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          reply.ticket_id,
          reply.is_customer_reply ? 'customer' : 'agent',
          reply.user_id || null,
          reply.is_customer_reply ? (reply.customer_name || reply.ticket_customer_name) : (reply.agent_name || 'Agent'),
          reply.message,
          'text',
          reply.created_at || reply.sent_at || new Date()
        ]);
      } catch (error) {
        console.error(`❌ Error migrating reply ${reply.id}:`, error.message);
      }
    }
    
    console.log('✅ Database enhancement completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Enhanced replies table with chat-specific columns');
    console.log('   - Created chat_messages table for better message management');
    console.log('   - Created chat_sessions table for session tracking');
    console.log('   - Created chat_participants table for user tracking');
    console.log('   - Migrated existing replies to new chat_messages table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error enhancing database:', error);
    process.exit(1);
  }
}

enhanceChatDatabase(); 