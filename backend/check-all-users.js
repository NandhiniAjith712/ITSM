const { pool } = require('./database');

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in database...');
    
    const [users] = await pool.execute('SELECT id, name, email, role, is_active FROM users');
    
    console.log(`\n📝 Found ${users.length} total users:`);
    
    users.forEach(user => {
      console.log(`\n👤 ${user.name} (ID: ${user.id})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   ✅ Active: ${user.is_active ? 'Yes' : 'No'}`);
    });
    
    // Group by role
    const roleGroups = {};
    users.forEach(user => {
      if (!roleGroups[user.role]) roleGroups[user.role] = [];
      roleGroups[user.role].push(user);
    });
    
    console.log('\n📊 Users by role:');
    Object.keys(roleGroups).forEach(role => {
      console.log(`\n🎭 ${role}: ${roleGroups[role].length} users`);
      roleGroups[role].forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAllUsers();
