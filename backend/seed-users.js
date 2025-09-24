const { pool } = require('./database');
const { hashPassword } = require('./middleware/auth');

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    const users = [
      {
        email: 'admin@company.com',
        name: 'System Administrator',
        password: 'admin123',
        role: 'admin',
        department: 'IT'
      },
      {
        email: 'ceo@company.com',
        name: 'CEO Executive',
        password: 'ceo123',
        role: 'ceo',
        department: 'Executive'
      },
      {
        email: 'manager@company.com',
        name: 'Support Manager',
        password: 'manager123',
        role: 'support_manager',
        department: 'Support'
      },
      {
        email: 'executive1@company.com',
        name: 'Support Executive 1',
        password: 'exec123',
        role: 'support_executive',
        department: 'Support'
      },
      {
        email: 'executive2@company.com',
        name: 'Support Executive 2',
        password: 'exec123',
        role: 'support_executive',
        department: 'Support'
      },
      {
        email: 'customer1@example.com',
        name: 'John Customer',
        password: 'customer123',
        role: 'user',
        department: null
      },
      {
        email: 'customer2@example.com',
        name: 'Jane Customer',
        password: 'customer123',
        role: 'user',
        department: null
      }
    ];

    for (const user of users) {
      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      );

      if (existingUsers.length === 0) {
        // Hash password
        const hashedPassword = await hashPassword(user.password);

        // Create user
        // Map support_executive role to 'user' for users table compatibility
        const userRole = user.role === 'support_executive' ? 'user' : user.role;
        await pool.execute(
          `INSERT INTO users (email, name, password_hash, role, department) 
           VALUES (?, ?, ?, ?, ?)`,
          [user.email, user.name, hashedPassword, userRole, user.department]
        );

        console.log(`✅ Created user: ${user.name} (${user.role})`);
      } else {
        console.log(`⏭️  User already exists: ${user.name}`);
      }
    }

    // Set manager relationships using a different approach
    console.log('🔗 Setting manager relationships...');
    
    // Get manager IDs
    const [managerResult] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['manager@company.com']
    );
    
    const [ceoResult] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['ceo@company.com']
    );
    
    if (managerResult.length > 0) {
      const managerId = managerResult[0].id;
      // Update support executives to have the manager as their manager
      // Note: support_executive role is stored as 'user' in users table
      await pool.execute(
        'UPDATE users SET manager_id = ? WHERE role = ?',
        [managerId, 'user']
      );
      console.log('✅ Set manager relationships for support executives');
    }
    
    if (ceoResult.length > 0) {
      const ceoId = ceoResult[0].id;
      // Update support managers to have the CEO as their manager
      await pool.execute(
        'UPDATE users SET manager_id = ? WHERE role = ?',
        [ceoId, 'support_manager']
      );
      console.log('✅ Set manager relationships for support managers');
    }

    console.log('✅ User seeding completed!');
    console.log('\n📋 Test Accounts:');
    console.log('👤 Admin: admin@company.com / admin123');
    console.log('👤 CEO: ceo@company.com / ceo123');
    console.log('👤 Manager: manager@company.com / manager123');
    console.log('👤 Executive 1: executive1@company.com / exec123');
    console.log('👤 Executive 2: executive2@company.com / exec123');
    console.log('👤 Customer 1: customer1@example.com / customer123');
    console.log('👤 Customer 2: customer2@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit(0);
  }
}

seedUsers(); 