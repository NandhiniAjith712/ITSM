# 🗑️ Ticket Data Truncation Scripts

This directory contains scripts to safely truncate all ticket-related data while preserving the database structure and maintaining referential integrity.

## 📁 Files

- `truncate-tickets-data.js` - Node.js script for truncating ticket data
- `truncate-tickets-data.sql` - SQL script for truncating ticket data
- `TRUNCATE_TICKETS_README.md` - This documentation file

## ⚠️ WARNING

**This will delete ALL ticket-related data!** This action cannot be undone. Make sure you have backups before running these scripts.

## 🎯 What Gets Deleted

The following tables will be truncated (in the correct order to maintain referential integrity):

1. **chat_participants** - Chat participants data
2. **chat_messages** - Chat messages
3. **chat_sessions** - Chat sessions
4. **escalations** - Ticket escalations
5. **sla_timers** - SLA timer data
6. **performance_ratings** - Performance ratings
7. **replies** - Ticket replies
8. **ticket_assignments** - Ticket assignments
9. **agent_sessions** - Agent session data
10. **tickets** - Main tickets table
11. **whatsapp_conversations** - WhatsApp conversations

## 🚀 How to Use

### Option 1: Node.js Script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the Node.js script
node truncate-tickets-data.js
```

**Features:**
- ✅ Automatic foreign key constraint handling
- ✅ Progress reporting
- ✅ Error handling and fallback to DELETE if TRUNCATE fails
- ✅ Verification of results
- ✅ Detailed logging

### Option 2: SQL Script

```bash
# Navigate to backend directory
cd backend

# Run the SQL script using MySQL command line
mysql -u your_username -p your_database_name < truncate-tickets-data.sql
```

Or run it directly in MySQL Workbench or phpMyAdmin.

## 🔍 Verification

Both scripts will show you:
- Data counts before truncation
- Progress during truncation
- Data counts after truncation
- Success confirmation

## 🛡️ Safety Features

1. **Foreign Key Handling**: Temporarily disables foreign key checks during truncation
2. **Ordered Deletion**: Deletes child tables before parent tables
3. **Error Recovery**: Falls back to DELETE if TRUNCATE fails
4. **Verification**: Shows before/after data counts
5. **Rollback Protection**: Re-enables foreign key checks even if errors occur

## 📊 What's Preserved

The following data will **NOT** be deleted:
- ✅ User accounts and profiles
- ✅ Agent accounts and profiles
- ✅ Products and modules
- ✅ SLA configurations
- ✅ Database structure and relationships
- ✅ Foreign key constraints
- ✅ Indexes and constraints

## 🔄 After Truncation

After running the script:
1. All ticket-related data will be cleared
2. Database structure remains intact
3. You can start fresh with new tickets
4. All relationships and constraints are preserved
5. System is ready for new data

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Make sure you have proper database permissions
   # Run as database admin or user with TRUNCATE privileges
   ```

2. **Foreign Key Constraint Errors**
   - The script automatically handles this by disabling foreign key checks
   - If you see these errors, the script will fall back to DELETE operations

3. **Table Not Found**
   - The script will skip tables that don't exist
   - This is normal if some tables haven't been created yet

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your database connection settings
3. Ensure you have proper database permissions
4. Check that the database exists and is accessible

## 📝 Example Output

```
🚀 Ticket Data Truncation Script
================================

📊 Current data counts:
  tickets: 150 rows
  replies: 300 rows
  performance_ratings: 50 rows
  chat_messages: 200 rows
  chat_sessions: 25 rows
  escalations: 10 rows
  sla_timers: 75 rows
  ticket_assignments: 100 rows
  agent_sessions: 30 rows
  whatsapp_conversations: 45 rows

⚠️  WARNING: This will delete ALL ticket-related data!
   This action cannot be undone.
   Make sure you have backups if needed.

🔄 Proceeding with truncation...

🗑️  Starting ticket data truncation...
📋 Tables to be truncated:
  1. chat_participants
  2. chat_messages
  3. chat_sessions
  4. escalations
  5. sla_timers
  6. performance_ratings
  7. replies
  8. ticket_assignments
  9. agent_sessions
  10. tickets
  11. whatsapp_conversations

🗑️  Truncating table: chat_participants
✅ Truncated chat_participants (25 rows deleted)
🗑️  Truncating table: chat_messages
✅ Truncated chat_messages (200 rows deleted)
...
✅ Truncated tickets (150 rows deleted)
✅ Truncated whatsapp_conversations (45 rows deleted)

🎯 Ticket data truncation completed!

📊 Summary:
✅ All ticket-related data has been cleared
✅ Database structure preserved
✅ Referential integrity maintained
✅ Foreign key constraints re-enabled

🔍 Verification:
  tickets: 0 rows
  replies: 0 rows
  performance_ratings: 0 rows
  chat_messages: 0 rows

✅ Script completed successfully!
```
