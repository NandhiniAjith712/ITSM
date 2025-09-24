# SLA Management System - Architecture Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SLA MANAGEMENT SYSTEM                                        │
│                                    Complete Architecture                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND LAYER                                             │
│                                    React.js Application                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   User Form     │  │ Admin Dashboard │  │Manager Dashboard│  │  CEO Dashboard  │         │
│  │   (Public)      │  │   (Agents)      │  │   (Managers)    │   │   (Executives)  │         │
│  │                 │  │                 │  │                 │   │                 │         │
│  │ • Ticket Submit │  │ • Ticket Mgmt   │  │ • Team Overview │   │ • Executive     │         │
│  │ • File Upload   │  │ • Reply System  │  │ • Performance   │   │   Reports       │         │
│  │ • Phone Input   │  │ • Status Update │  │ • Escalation    │   │ • Analytics     │         │
│  │ • Validation    │  │ • Real-time     │  │ • SLA Monitoring│   │ • KPI Tracking  │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘         │
│           │                     │                     │                      │                │
│           └─────────────────────┼─────────────────────┼──────────────────────┘                │
│                                 │                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              REACT COMPONENTS & STATE                                    │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │  Redux Toolkit  │  │  React Query    │  │  React Router   │  │  Material-UI    │   │ │
│  │  │  (State Mgmt)   │  │  (Data Fetch)   │  │  (Navigation)   │  │  (UI Library)   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │  React Hook     │  │  Chart.js       │  │  Socket.io      │  │  Axios HTTP     │   │ │
│  │  │  Form (Forms)   │  │  (Charts)       │  │  (Real-time)    │  │  (API Client)   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    API GATEWAY LAYER                                          │
│                                    Express.js Server                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              SECURITY MIDDLEWARE                                          │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │     Helmet      │  │  Rate Limiter   │  │      CORS       │  │  JWT Auth       │   │ │
│  │  │  (Security)     │  │  (API Protect)  │  │  (Cross-Origin) │  │  (Auth/Token)   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              API ROUTES & CONTROLLERS                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │   /api/auth     │  │  /api/tickets   │  │  /api/replies   │  │  /api/users     │   │ │
│  │  │  (Auth Routes)  │  │  (Ticket Mgmt)  │  │  (Reply System) │  │  (User Mgmt)    │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │ /api/whatsapp   │  │ /api/upload     │  │  /api/health    │  │  /api/analytics │   │ │
│  │  │  (WhatsApp API) │  │  (File Upload)  │  │  (Health Check)  │  │  (Reports)      │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              BUSINESS LOGIC LAYER                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │  Ticket Service │  │  Reply Service  │  │  User Service   │  │  Auth Service   │   │ │
│  │  │  (CRUD Ops)     │  │  (Messaging)    │  │  (User Mgmt)    │  │  (JWT/Login)    │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │ WhatsApp Service│  │  File Service   │  │  Email Service  │  │  SLA Service    │   │ │
│  │  │  (Notifications)│  │  (Upload/Store) │  │  (SMTP/Nodemail)│  │  (SLA Rules)    │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE LAYER                                             │
│                                    MySQL Database                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              DATABASE SCHEMA                                              │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │     tickets     │  │     replies     │  │      users      │  │     agents      │   │ │
│  │  │  (Main Table)   │  │  (Messages)     │  │  (User Mgmt)    │  │  (Agent Data)   │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • id, name      │  │ • id, ticket_id │  │ • id, email     │  │ • id, name      │   │ │
│  │  │ • email, mobile │  │ • message, user │  │ • name, role    │  │ • email, pass   │   │ │
│  │  │ • description   │  │ • created_at    │  │ • department    │  │ • created_at    │   │ │
│  │  │ • status, priority│  │ • is_internal  │  │ • manager_id    │  │                 │   │ │
│  │  │ • created_at    │  │                 │  │ • is_active     │  │                 │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │performance_ratings│  │whatsapp_conversations│  │ sla_policies   │  │  audit_logs    │   │ │
│  │  │  (Ratings)      │  │  (WhatsApp)    │  │  (SLA Rules)    │  │  (Audit Trail)  │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • id, exec_id   │  │ • id, phone     │  │ • id, name      │  │ • id, action    │   │ │
│  │  │ • manager_id    │  │ • user_id       │  │ • response_time │  │ • user_id       │   │ │
│  │  │ • rating, comment│  │ • conversation  │  │ • escalation    │  │ • timestamp     │   │ │
│  │  │ • created_at    │  │ • state         │  │ • conditions    │  │ • details       │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              DATABASE OPTIMIZATION                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │ Connection Pool │  │   Indexing      │  │  Transactions   │  │  Foreign Keys    │   │ │
│  │  │  (mysql2)       │  │  (Performance)  │  │  (ACID)         │  │  (Integrity)    │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EXTERNAL SERVICES                                          │
│                                    Third-Party Integrations                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              COMMUNICATION SERVICES                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │ WhatsApp Business│  │    Twilio SMS   │  │   Nodemailer    │  │  Socket.io      │   │ │
│  │  │     API         │  │   (SMS API)     │  │   (Email)       │  │  (Real-time)    │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • Notifications │  │ • Urgent Alerts │  │ • Status Updates│  │ • Live Updates  │   │ │
│  │  │ • Templates     │  │ • Escalations   │  │ • Reports       │  │ • Notifications │   │ │
│  │  │ • Media Support │  │ • Delivery Conf │  │ • Attachments   │  │ • Status Changes│   │ │
│  │  │ • Webhook       │  │ • Error Handling│  │ • Templates     │  │ • Real-time     │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              STORAGE & INFRASTRUCTURE                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │    AWS S3       │  │   Local Upload  │  │   Environment   │  │   Development   │   │ │
│  │  │  (File Storage) │  │   (Multer)      │  │   Variables     │  │   Tools         │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • Templates     │  │ • File Upload   │  │ • Config Mgmt   │  │ • Nodemon       │   │ │
│  │  │ • Attachments   │  │ • Size Limits   │  │ • Security      │  │ • Hot Reload    │   │ │
│  │  │ • CDN Access    │  │ • Type Filter   │  │ • Environment   │  │ • Debugging     │   │ │
│  │  │ • Versioning    │  │ • Error Handle  │  │ • Deployment    │  │ • Development   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA FLOW DIAGRAM                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│  │   User Form     │───▶│  API Gateway    │───▶│  Business Logic │───▶│   Database      │   │
│  │  (Frontend)     │    │  (Express.js)   │    │  (Services)     │    │   (MySQL)       │   │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘   │
│           │                       │                       │                       │           │
│           │                       │                       │                       │           │
│           ▼                       ▼                       ▼                       ▼           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│  │  Real-time      │◀───│  Socket.io      │◀───│  Event System   │◀───│  Data Changes   │   │
│  │  Updates        │    │  (WebSocket)    │    │  (Notifications)│    │  (Triggers)     │   │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘   │
│           │                       │                       │                       │           │
│           │                       │                       │                       │           │
│           ▼                       ▼                       ▼                       ▼           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│  │  External       │◀───│  WhatsApp API   │◀───│  Notification   │◀───│  SLA Rules      │   │
│  │  Notifications  │    │  (Meta)         │    │  Service        │    │  (Business)     │   │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SECURITY ARCHITECTURE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              SECURITY LAYERS                                              │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │   Helmet       │  │  Rate Limiter   │  │      CORS       │  │  Input Validation│   │ │
│  │  │  (HTTP Headers) │  │  (DDoS Protect) │  │  (Cross-Origin) │  │  (Sanitization) │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │  JWT Auth       │  │  bcryptjs       │  │  File Upload    │  │  SQL Injection   │   │ │
│  │  │  (Token Based)  │  │  (Password Hash)│  │  Security       │  │  Protection      │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DEPLOYMENT ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              PRODUCTION ENVIRONMENT                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │   Frontend      │  │   Backend API   │  │   Database      │  │   File Storage  │   │ │
│  │  │  (React Build)  │  │  (Node.js)      │  │  (MySQL)        │  │  (AWS S3)       │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • Static Files  │  │ • Express.js    │  │ • RDS Instance  │  │ • Templates     │   │ │
│  │  │ • CDN Delivery  │  │ • PM2 Process   │  │ • Backup        │  │ • Attachments   │   │ │
│  │  │ • HTTPS         │  │ • Load Balancer │  │ • Replication   │  │ • Versioning    │   │ │
│  │  │ • Compression   │  │ • Auto Scaling  │  │ • Monitoring    │  │ • CDN           │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              DEVELOPMENT ENVIRONMENT                                      │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │ │
│  │  │   React Dev     │  │   Node.js Dev   │  │   Local MySQL   │  │   Local Files   │   │ │
│  │  │  (Port 3000)    │  │  (Port 5000)    │  │  (Port 3306)    │  │  (Uploads/)     │   │ │
│  │  │                 │  │                 │  │                 │  │                 │   │ │
│  │  │ • Hot Reload    │  │ • Nodemon       │  │ • Development   │  │ • Development   │   │ │
│  │  │ • Dev Tools     │  │ • Debug Mode    │  │   Database      │  │   Storage       │   │ │
│  │  │ • Source Maps   │  │ • Logging       │  │ • Test Data     │  │ • Local Path    │   │ │
│  │  │ • Error Overlay │  │ • Error Handler │  │ • Seed Data     │  │ • File System   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TECHNOLOGY STACK SUMMARY                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND STACK:                                                                              │
│  • React.js (v19) - Component-based UI library                                               │
│  • Redux Toolkit - State management                                                           │
│  • Material-UI (MUI v7) - UI component library                                               │
│  • React Router DOM - Client-side routing                                                     │
│  • Axios - HTTP client for API communication                                                 │
│  • Socket.io Client - Real-time communication                                                │
│  • Chart.js + Recharts - Data visualization                                                  │
│  • React Hook Form - Form handling and validation                                            │
│  • React Testing Library - Component testing                                                 │
│                                                                                               │
│  BACKEND STACK:                                                                               │
│  • Node.js - JavaScript runtime environment                                                   │
│  • Express.js - Web application framework                                                    │
│  • MySQL (mysql2) - Relational database with connection pooling                              │
│  • JWT + bcryptjs - Authentication and password hashing                                     │
│  • Helmet + Rate Limiter + CORS - Security middleware                                        │
│  • Multer - File upload handling                                                             │
│  • Socket.io - Real-time bidirectional communication                                         │
│  • Nodemailer - Email service                                                                │
│  • Express Validator - Input validation and sanitization                                     │
│                                                                                               │
│  EXTERNAL SERVICES:                                                                           │
│  • WhatsApp Business API - Messaging and notifications                                       │
│  • Twilio API - SMS notifications                                                            │
│  • AWS S3 - File storage and CDN                                                             │
│                                                                                               │
│  DEVELOPMENT TOOLS:                                                                           │
│  • Nodemon - Development server with hot reload                                              │
│  • dotenv - Environment variable management                                                   │
│  • Jest + React Testing Library - Testing framework                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    KEY FEATURES & CAPABILITIES                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ✅ REAL-TIME CAPABILITIES:                                                                   │
│  • Live ticket status updates via WebSocket connections                                      │
│  • Instant notifications for SLA breaches and escalations                                    │
│  • Real-time dashboard updates across all user roles                                        │
│  • Live chat functionality between agents and users                                          │
│                                                                                               │
│  ✅ SECURITY FEATURES:                                                                        │
│  • JWT-based authentication with role-based access control                                   │
│  • Password hashing with bcryptjs for secure storage                                        │
│  • Input validation and sanitization to prevent injection attacks                           │
│  • Rate limiting to prevent API abuse and DDoS attacks                                      │
│  • CORS protection for cross-origin request security                                        │
│  • File upload security with type and size validation                                       │
│                                                                                               │
│  ✅ SCALABILITY FEATURES:                                                                     │
│  • Connection pooling for efficient database operations                                      │
│  • Modular architecture for easy feature additions                                          │
│  • Stateless authentication for horizontal scaling                                           │
│  • Cloud-ready deployment with environment-based configuration                               │
│  • CDN integration for static asset delivery                                                │
│                                                                                               │
│  ✅ MONITORING & ANALYTICS:                                                                   │
│  • Comprehensive logging for debugging and monitoring                                        │
│  • Performance metrics tracking for SLA compliance                                          │
│  • User activity tracking and audit trails                                                  │
│  • Real-time dashboard analytics for executives                                             │
│  • Error tracking and reporting for system health                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## 📋 Architecture Benefits

### 🚀 **Performance**
- **Connection Pooling**: Efficient database connections with mysql2
- **Real-time Updates**: WebSocket connections for instant data synchronization
- **Optimized Queries**: Strategic indexing and query optimization
- **CDN Integration**: Fast static asset delivery via AWS S3

### 🔒 **Security**
- **Multi-layer Security**: Helmet, Rate Limiting, CORS, JWT, Input Validation
- **Data Protection**: bcryptjs password hashing, SQL injection prevention
- **File Security**: Upload validation, type checking, size limits
- **API Protection**: Rate limiting, authentication, authorization

### 📈 **Scalability**
- **Modular Architecture**: Easy to add new features and modules
- **Stateless Design**: JWT-based authentication supports horizontal scaling
- **Cloud-Ready**: Environment-based configuration for different deployments
- **Database Optimization**: Connection pooling, indexing, transaction management

### 🛠️ **Maintainability**
- **Clean Code Structure**: Separated concerns with clear module boundaries
- **Comprehensive Testing**: React Testing Library and Jest for quality assurance
- **Documentation**: Detailed API documentation and architecture guides
- **Development Tools**: Hot reloading, debugging, and development utilities

### 🔄 **Reliability**
- **Error Handling**: Comprehensive error handling across all layers
- **Data Integrity**: ACID compliance with MySQL transactions
- **Backup & Recovery**: Database backup strategies and recovery procedures
- **Monitoring**: Health checks, logging, and performance monitoring

---

*This architecture provides a robust, scalable, and secure foundation for the SLA Management System, ensuring optimal performance, security, and user experience across all system components.* 