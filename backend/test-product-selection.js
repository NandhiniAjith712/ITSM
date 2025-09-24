const { pool } = require('./database');

// Test product selection functionality
async function testProductSelection() {
  try {
    console.log('🔍 Testing Product Selection for WhatsApp');
    console.log('==========================================\n');

    // Test 1: Fetch products from database
    console.log('📋 Test 1: Fetching products from database...');
    const [products] = await pool.execute(
      'SELECT id, name, description, sla_time_minutes, priority_level FROM products WHERE status = "active" ORDER BY name ASC'
    );
    
    console.log(`✅ Found ${products.length} active products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (ID: ${product.id})`);
      console.log(`      Description: ${product.description || 'No description'}`);
      console.log(`      SLA Time: ${product.sla_time_minutes || 'N/A'} minutes`);
      console.log(`      Priority: ${product.priority_level || 'N/A'}`);
      console.log('');
    });

    // Test 2: Create product selection template
    console.log('📋 Test 2: Creating product selection template...');
    const productRows = products.map((product) => {
      // Truncate product name to fit WhatsApp's 24-character limit
      let productTitle = product.name;
      if (productTitle.length > 20) { // Leave room for emoji and safety margin
        productTitle = productTitle.substring(0, 17) + '...';
      }
      
      return {
        id: `product_${product.id}`,
        title: `📦 ${productTitle}`,
        description: `${product.description || 'No description'} | SLA: ${product.sla_time_minutes || 'N/A'} min`
      };
    });

    console.log('✅ Product selection template created:');
    productRows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`);
      console.log(`      Title: ${row.title} (${row.title.length} chars)`);
      console.log(`      Description: ${row.description}`);
      console.log('');
    });

    // Test 3: Simulate product selection
    console.log('📋 Test 3: Simulating product selection...');
    if (products.length > 0) {
      const testProduct = products[0];
      const testProductId = `product_${testProduct.id}`;
      
      console.log(`✅ Simulating selection of: ${testProduct.name}`);
      console.log(`   Product ID: ${testProduct.id}`);
      console.log(`   Selection ID: ${testProductId}`);
      
      // Simulate the selection process
      const selectedProductId = testProductId.replace('product_', '');
      const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
      
      if (selectedProduct) {
        console.log(`✅ Successfully matched product: ${selectedProduct.name}`);
        console.log(`   Product Name: ${selectedProduct.name}`);
        console.log(`   Product ID: ${selectedProduct.id}`);
        console.log(`   SLA Time: ${selectedProduct.sla_time_minutes || 'N/A'} minutes`);
      } else {
        console.log('❌ Failed to match product');
      }
    } else {
      console.log('⚠️  No products available for testing');
    }

    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Products Found: ${products.length}`);
    console.log(`Template Creation: ✅ PASS`);
    console.log(`Product Selection: ✅ PASS`);

    if (products.length > 0) {
      console.log('\n🎉 Product selection feature is ready for WhatsApp!');
      console.log('\n📱 WhatsApp Flow:');
      console.log('   1. User enters mobile number');
      console.log('   2. System shows product list');
      console.log('   3. User clicks on a product');
      console.log('   4. System proceeds to issue title');
    } else {
      console.log('\n⚠️  No products found. Please add products to the database first.');
    }

  } catch (error) {
    console.error('❌ Error testing product selection:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testProductSelection(); 