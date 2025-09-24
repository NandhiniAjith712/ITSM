# 🚀 ITSM Backend Server Startup Guide

## Quick Start Options

### Option 1: Using npm (Recommended)
```bash
cd tick/backend
npm start
```

### Option 2: Using Node directly
```bash
cd tick/backend
node server.js
```

### Option 3: Using Windows Batch File
```bash
# Double-click on start-server.bat
# OR run from command line:
start-server.bat
```

### Option 4: Using PowerShell
```powershell
# Right-click on start-server.ps1 and "Run with PowerShell"
# OR run from command line:
.\start-server.ps1
```

## 🎯 What Happens When Server Starts

1. ✅ **Email Service Initialized** - Gmail notifications ready
2. ✅ **Database Connected** - MySQL connection established
3. ✅ **Tables Initialized** - All required tables created
4. ✅ **WebSocket Server** - Real-time chat ready on `/ws`
5. ✅ **Scheduled Tasks** - Auto-escalation every 5 minutes
6. ✅ **Server Listening** - API available on port 5000

## 📧 Email Notification System

- **Gmail SMTP**: Configured and ready
- **Auto-Notifications**: Sent when agents reply to tickets
- **Customer Emails**: Automatically sent to ticket creators
- **Template**: Professional HTML emails with ticket details

## 🔧 Troubleshooting

### Server Won't Start
- Check if port 5000 is already in use
- Ensure MySQL is running
- Verify config.env file exists

### Email Not Working
- Check Gmail app password in config.env
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check server logs for email errors

### Database Connection Issues
- Ensure MySQL service is running
- Verify database credentials in config.env
- Check if tick_system database exists

## 📱 API Endpoints Available

- `GET /` - Server status
- `POST /api/chat/messages` - Create chat messages (triggers emails)
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new tickets
- `GET /api/users` - List users
- `GET /api/agents` - List agents

## 🎉 Success Indicators

When server starts successfully, you should see:
```
✅ Email service initialized successfully
✅ Database connected successfully
✅ Database tables initialized successfully
🔌 Initializing WebSocket server on path /ws
✅ WebSocket server initialized on path /ws
🚀 Starting scheduled auto-escalation system...
⏰ Will check for breached tickets every 5 minutes
🔄 Will update SLA timer statuses automatically
```

## 🚀 Auto-Start on System Boot

To make the server start automatically when you log in:

1. **Create a shortcut** to `start-server.bat` or `start-server.ps1`
2. **Press Win+R**, type `shell:startup`
3. **Copy the shortcut** to the startup folder

Now the server will start automatically every time you log into Windows!
