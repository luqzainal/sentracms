import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Setting up Add-On Services tables...');

async function setupAddOnServices() {
  try {
    // Create add_on_services table
    console.log('📋 Creating add_on_services table...');
    const { error: createServicesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS add_on_services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL CHECK (category IN ('Support', 'Analytics', 'Domain', 'Integration', 'Mobile', 'Security')),
          price DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable')),
          features JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    });
    
    if (createServicesError) {
      console.log('⚠️  add_on_services table might already exist:', createServicesError.message);
    } else {
      console.log('✅ add_on_services table created');
    }

    // Create client_service_requests table
    console.log('📋 Creating client_service_requests table...');
    const { error: createRequestsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS client_service_requests (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          service_id INTEGER NOT NULL REFERENCES add_on_services(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
          request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          approved_date TIMESTAMP WITH TIME ZONE,
          rejected_date TIMESTAMP WITH TIME ZONE,
          completed_date TIMESTAMP WITH TIME ZONE,
          admin_notes TEXT,
          rejection_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    });
    
    if (createRequestsError) {
      console.log('⚠️  client_service_requests table might already exist:', createRequestsError.message);
    } else {
      console.log('✅ client_service_requests table created');
    }

    // Insert sample data
    console.log('📝 Inserting sample add-on services...');
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO add_on_services (name, description, category, price, status, features) VALUES
        ('Premium Support', '24/7 priority support with dedicated account manager', 'Support', 299.00, 'Available', '["24/7 Support", "Dedicated Account Manager", "Priority Response", "Phone Support", "Email Support"]'),
        ('Advanced Analytics', 'Detailed reporting and analytics dashboard', 'Analytics', 199.00, 'Available', '["Custom Reports", "Real-time Analytics", "Data Export", "Performance Metrics", "User Behavior Tracking"]'),
        ('Custom Domain', 'Use your own domain name with SSL certificate', 'Domain', 99.00, 'Available', '["Custom Domain", "SSL Certificate", "DNS Management", "Domain Transfer", "Email Setup"]'),
        ('API Integration', 'Connect with third-party services via API', 'Integration', 399.00, 'Available', '["API Access", "Webhook Support", "Third-party Integration", "Custom Endpoints", "Documentation"]'),
        ('Mobile App', 'Native mobile application for iOS and Android', 'Mobile', 999.00, 'Unavailable', '["iOS App", "Android App", "Push Notifications", "Offline Support", "App Store Publishing"]'),
        ('Advanced Security', 'Enhanced security features and monitoring', 'Security', 149.00, 'Available', '["Two-Factor Authentication", "Security Monitoring", "Backup Encryption", "Access Control", "Audit Logs"]')
        ON CONFLICT (id) DO NOTHING
      `
    });
    
    if (insertError) {
      console.log('⚠️  Sample data might already exist:', insertError.message);
    } else {
      console.log('✅ Sample data inserted');
    }

    console.log('🎉 Add-On Services setup completed successfully!');
    console.log('📋 Tables created:');
    console.log('  ✓ add_on_services');
    console.log('  ✓ client_service_requests');
    console.log('📝 Sample data inserted');

  } catch (error) {
    console.error('❌ Error setting up Add-On Services:', error);
    process.exit(1);
  }
}

setupAddOnServices(); 