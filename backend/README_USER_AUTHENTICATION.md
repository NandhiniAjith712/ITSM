# 🔐 User Authentication System

## Overview

The User Authentication System provides secure login and registration functionality for users/clients, similar to the agent authentication system. Users can register with email and password, login securely, and access their profiles.

## 🚀 Features

### ✅ Secure Authentication
- **Password Hashing**: Passwords are securely hashed using bcrypt
- **JWT Tokens**: Secure JWT tokens for session management
- **Email Validation**: Proper email format validation
- **Password Requirements**: Minimum 6 characters required

### ✅ User Management
- **User Registration**: New users can register with email and password
- **User Login**: Secure login with email and password
- **Profile Management**: Users can view and update their profiles
- **Session Management**: JWT-based session handling

### ✅ Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Secure error messages without exposing sensitive data
- **Active Status**: Users can be deactivated if needed

## 🔧 How It Works

### 1. User Registration Process
```javascript
// Register new user
const response = await fetch('http://localhost:5000/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    department: 'IT'
  })
});
```

**Registration Steps:**
1. Validate input data (name, email, password)
2. Check if user already exists
3. Hash password using bcrypt
4. Create user in database
5. Return user data (without password)

### 2. User Login Process
```javascript
// Login user
const response = await fetch('http://localhost:5000/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});
```

**Login Steps:**
1. Validate email and password
2. Find user by email
3. Check if user is active
4. Validate password hash
5. Update last login timestamp
6. Generate JWT token
7. Return user data and token

### 3. Profile Management
```javascript
// Get user profile
const response = await fetch('http://localhost:5000/api/users/profile', {
  headers: { 'Authorization': 'Bearer <token>' }
});

// Update user profile
const response = await fetch('http://localhost:5000/api/users/profile', {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    name: 'Updated Name',
    department: 'Updated Department'
  })
});
```

## 📊 API Endpoints

### POST `/api/users/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "IT",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "department": "IT",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST `/api/users/login`
Login user with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "department": "IT",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "last_login": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET `/api/users/profile`
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "department": "IT",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT `/api/users/profile`
Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "department": "Updated Department"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST `/api/users/logout`
Logout user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## 🎨 Frontend Components

### UserLogin Component
A React component for user login with:
- Email and password validation
- Real-time form validation
- Error handling
- Loading states
- Test credentials display

**Usage:**
```jsx
import UserLogin from './components/UserLogin';

<UserLogin onLogin={(user) => console.log('User logged in:', user)} />
```

### UserRegistration Component
A React component for user registration with:
- Comprehensive form validation
- Password confirmation
- Real-time validation feedback
- Error handling
- Loading states

**Usage:**
```jsx
import UserRegistration from './components/UserRegistration';

<UserRegistration onRegister={(user) => console.log('User registered:', user)} />
```

## 🔄 Integration

### App.js Integration
The user authentication is integrated into the main App.js:

```javascript
// User login handler
const handleUserLogin = (userObj) => {
  setUser(userObj);
};

// User registration handler
const handleUserRegister = (userObj) => {
  setUser(userObj);
};

// Routes
<Route path="/user/login" element={<UserLogin onLogin={handleUserLogin} />} />
<Route path="/user/register" element={<UserRegistration onRegister={handleUserRegister} />} />
```

### Local Storage Management
User data is stored in localStorage:
- `userData`: User information
- `userToken`: JWT token for authentication

## 📈 Security Features

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 6 characters required
- **Storage**: Passwords are never stored in plain text

### Token Security
- **JWT**: Secure JSON Web Tokens
- **Expiration**: 24-hour token expiration
- **Validation**: Server-side token validation

### Input Validation
- **Email**: Proper email format validation
- **Name**: 2-100 characters required
- **Password**: Minimum 6 characters required
- **Sanitization**: Input sanitization and normalization

## 🛠️ Configuration

### Database Requirements
- `users` table with `password_hash` column
- `is_active` boolean field for user status
- `last_login` timestamp field

### Environment Variables
```bash
JWT_SECRET=your_jwt_secret_key_here
```

## 🚨 Troubleshooting

### Common Issues

1. **Password Hash Column Missing**
   - Run database initialization
   - Check if `password_hash` column exists

2. **JWT Token Issues**
   - Verify JWT_SECRET environment variable
   - Check token expiration

3. **User Not Found**
   - Verify email exists in database
   - Check if user is active

### Debug Commands
```bash
# Test user authentication system
node test-user-auth.js

# Check user registration
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Check user login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🎯 Test Credentials

### Default Test User
```
Email: user@example.com
Password: user123
Role: user
Department: IT
```

### New Test User
```
Email: newuser@example.com
Password: newuser123
Role: user
Department: Marketing
```

## 📝 Conclusion

The User Authentication System provides a robust, secure solution for user authentication and management. It ensures data security, provides excellent user experience, and integrates seamlessly with the existing ticketing system.

**Key Benefits:**
- ✅ **Secure**: Password hashing and JWT tokens
- ✅ **User-Friendly**: Intuitive login and registration forms
- ✅ **Scalable**: Works with any number of users
- ✅ **Maintainable**: Clean code structure and documentation
- ✅ **Tested**: Comprehensive test coverage

**Ready for Production! 🚀**
