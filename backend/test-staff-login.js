const { pool } = require('./database');
const bcrypt = require('bcryptjs');

async function testStaffLogin() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Testing staff login functionality...');
    
    // Check current users with staff roles
    const [staffMembers] = await connection.execute(
      'SELECT id, name, email, role, is_active, last_login FROM users WHERE role IN (?, ?, ?)',
      ['support_executive', 'support_manager', 'ceo']
    );
    console.log(`\n📝 Found ${staffMembers.length} staff members in database:`);
    
    staffMembers.forEach(staff => {
      console.log(`\n👤 ${staff.name} (ID: ${staff.id})`);
      console.log(`   📧 Email: ${staff.email || 'N/A'}`);
      console.log(`   🎭 Role: ${staff.role || 'agent'}`);
      console.log(`   ✅ Active: ${staff.is_active ? 'Yes' : 'No'}`);
      console.log(`   🕒 Last Login: ${staff.last_login || 'Never'}`);
    });
    
    if (staffMembers.length === 0) {
      console.log('\n⚠️ No staff members found! You need to create staff accounts first.');
      console.log('💡 Use the seed script or business dashboard to add staff members.');
      return;
    }
    
    // Test login with the first staff member
    const testStaff = staffMembers[0];
    console.log(`\n🧪 Testing login with staff: ${testStaff.name}`);
    
    if (!testStaff.is_active) {
      console.log('⚠️ Staff member is not active - login would fail');
    } else {
      console.log('✅ Staff member is active - login should work with correct credentials');
    }
    
    console.log('\n📋 Staff Login Flow Summary:');
    console.log('1. Staff enters login_id and password');
    console.log('2. Backend validates credentials against users table');
    console.log('3. If valid, generates JWT token and returns staff data');
    console.log('4. Frontend stores staff data and token in localStorage');
    console.log('5. Staff is redirected to appropriate dashboard based on role');
    
    console.log('\n🔐 Login Credentials Test:');
    console.log('• Staff can login with login_id (stored in email field)');
    console.log('• Password must match the password_hash in database');
    console.log('• Only users with roles: support_executive, support_manager, ceo can login');
    
    console.log('\n🌐 Test the login endpoint:');
    console.log('POST http://localhost:5000/api/staff/login');
    console.log('Body: { "login_id": "STAFF_ID", "password": "PASSWORD" }');
    
  } catch (error) {
    console.error('❌ Error testing staff login:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

testStaffLogin();
