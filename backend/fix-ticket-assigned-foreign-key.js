const { pool } = require('./database');

async function fixAssignedForeignKey() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Fixing tickets.assigned_to foreign key...');

    // Find any existing foreign keys on tickets.assigned_to
    const [rows] = await connection.execute(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tickets'
        AND COLUMN_NAME = 'assigned_to'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (rows.length === 0) {
      console.log('ℹ️  No existing foreign key found on tickets.assigned_to');
    } else {
      for (const fk of rows) {
        console.log(`🔎 Found FK ${fk.CONSTRAINT_NAME} -> ${fk.REFERENCED_TABLE_NAME}(id)`);
        // Drop any FK (agents or users) to recreate cleanly
        try {
          await connection.execute(`ALTER TABLE tickets DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
          console.log(`✅ Dropped FK ${fk.CONSTRAINT_NAME}`);
        } catch (e) {
          console.log(`⚠️  Could not drop FK ${fk.CONSTRAINT_NAME}: ${e.message}`);
        }
      }
    }

    // Add the correct FK to users(id)
    try {
      await connection.execute(
        'ALTER TABLE tickets ADD CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL'
      );
      console.log('✅ Added FK fk_assigned_to -> users(id)');
    } catch (e) {
      console.log(`⚠️  Could not add FK fk_assigned_to: ${e.message}`);
    }

    console.log('🎉 Foreign key fix completed.');
  } catch (error) {
    console.error('❌ Failed to fix foreign key:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

if (require.main === module) {
  fixAssignedForeignKey();
}

module.exports = { fixAssignedForeignKey };


