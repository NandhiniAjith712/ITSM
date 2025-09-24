const http = require('http');

const makeRequest = (path, method = 'GET', body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
};

const testTicketsAPI = async () => {
  try {
    console.log('🔍 Testing tickets API with authentication...');
    
    // First, let's login as an agent to get a token
    console.log('\n🔐 Logging in as agent...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('👤 User:', loginResponse.data.data.user);
    
    const token = loginResponse.data.data.token;
    
    // Now test the tickets API
    console.log('\n📋 Fetching tickets...');
    const ticketsResponse = await makeRequest('/api/tickets', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });
    
    if (ticketsResponse.status !== 200) {
      console.error('❌ Failed to fetch tickets:', ticketsResponse.data);
      return;
    }
    
    console.log('✅ Tickets fetched successfully');
    console.log(`📊 Found ${ticketsResponse.data.data.length} tickets`);
    console.log('👤 User role:', ticketsResponse.data.userRole);
    
    if (ticketsResponse.data.data.length > 0) {
      console.log('\n📋 Sample tickets:');
      ticketsResponse.data.data.slice(0, 5).forEach(ticket => {
        console.log(`- Ticket #${ticket.id}: "${ticket.issue_title}" (${ticket.status}) - Assigned to: ${ticket.assigned_to}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testTicketsAPI()
  .then(() => {
    console.log('\n🎉 API testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 API testing failed:', error);
    process.exit(1);
  });
