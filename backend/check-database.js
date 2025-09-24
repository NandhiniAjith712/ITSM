const { pool } = require('./database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database Structure...\n');

    // Check if tickets table exists and has data
    console.log('1️⃣ Checking tickets table...');
    try {
      const [tickets] = await pool.execute('SELECT COUNT(*) as count FROM tickets');
      console.log('✅ Tickets table exists');
      console.log('📊 Total tickets:', tickets[0].count);
      
      if (tickets[0].count > 0) {
        const [sampleTicket] = await pool.execute('SELECT id, name, issue_title FROM tickets LIMIT 1');
        console.log('📋 Sample ticket:', sampleTicket[0]);
      }
    } catch (error) {
      console.log('❌ Tickets table error:', error.message);
    }

    console.log('');

    // Check if chat_messages table exists
    console.log('2️⃣ Checking chat_messages table...');
    try {
      const [messages] = await pool.execute('SELECT COUNT(*) as count FROM chat_messages');
      console.log('✅ chat_messages table exists');
      console.log('📊 Total messages:', messages[0].count);
    } catch (error) {
      console.log('❌ chat_messages table error:', error.message);
      console.log('   This might be because the table doesn\'t exist');
    }

    console.log('');

    // Check if chat_sessions table exists
    console.log('3️⃣ Checking chat_sessions table...');
    try {
      const [sessions] = await pool.execute('SELECT COUNT(*) as count FROM chat_sessions');
      console.log('✅ chat_sessions table exists');
      console.log('📊 Total sessions:', sessions[0].count);
    } catch (error) {
      console.log('❌ chat_sessions table error:', error.message);
      console.log('   This might be because the table doesn\'t exist');
    }

    console.log('');

    // Check if chat_participants table exists
    console.log('4️⃣ Checking chat_participants table...');
    try {
      const [participants] = await pool.execute('SELECT COUNT(*) as count FROM chat_participants');
      console.log('✅ chat_participants table exists');
      console.log('📊 Total participants:', participants[0].count);
    } catch (error) {
      console.log('❌ chat_participants table error:', error.message);
      console.log('   This might be because the table doesn\'t exist');
    }

    console.log('');

    // Check if users table exists
    console.log('5️⃣ Checking users table...');
    try {
      const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
      console.log('✅ users table exists');
      console.log('📊 Total users:', users[0].count);
    } catch (error) {
      console.log('❌ users table error:', error.message);
    }

    console.log('\n🎉 Database check completed!');
    console.log('================================');
    
    // Provide recommendations
    console.log('\n📋 Recommendations:');
    console.log('1. If any chat tables are missing, restart the server to create them');
    console.log('2. If no tickets exist, create some test tickets first');
    console.log('3. If no users exist, create some test users first');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase(); 