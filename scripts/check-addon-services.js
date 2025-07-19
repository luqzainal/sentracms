import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkAddOnServices() {
  try {
    console.log('🔍 Checking Add-On Services in Database...\n');
    
    const services = await sql`
      SELECT id, name, description, category, price, status 
      FROM add_on_services 
      ORDER BY id
    `;
    
    console.log('📋 All Add-On Services:');
    console.log('='.repeat(80));
    
    services.forEach(service => {
      console.log(`ID: ${service.id}`);
      console.log(`Name: ${service.name}`);
      console.log(`Description: ${service.description}`);
      console.log(`Category: ${service.category}`);
      console.log(`Price: RM ${service.price}`);
      console.log(`Status: ${service.status}`);
      console.log('-'.repeat(40));
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Total Services: ${services.length}`);
    console.log(`Available: ${services.filter(s => s.status === 'Available').length}`);
    console.log(`Unavailable: ${services.filter(s => s.status === 'Unavailable').length}`);
    
  } catch (error) {
    console.error('❌ Error checking add-on services:', error);
  } finally {
    process.exit(0);
  }
}

checkAddOnServices(); 