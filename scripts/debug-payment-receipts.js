import { neon } from '@neondatabase/serverless';

// Use the same connection string as the app
const connectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(connectionString);

async function debugPaymentReceipts() {
  try {
    console.log('🔍 Checking payment receipts in database...\n');
    
    // Check all payments
    const payments = await sql`
      SELECT 
        id,
        client_id,
        invoice_id,
        amount,
        payment_source,
        status,
        paid_at,
        receipt_file_url,
        created_at,
        updated_at
      FROM payments
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${payments.length} payments in database:\n`);
    
    payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`);
      console.log(`  ID: ${payment.id}`);
      console.log(`  Client ID: ${payment.client_id}`);
      console.log(`  Invoice ID: ${payment.invoice_id}`);
      console.log(`  Amount: RM ${payment.amount}`);
      console.log(`  Payment Source: ${payment.payment_source}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Paid At: ${payment.paid_at}`);
      console.log(`  Receipt File URL: ${payment.receipt_file_url || 'NULL'}`);
      console.log(`  Created At: ${payment.created_at}`);
      console.log(`  Updated At: ${payment.updated_at}`);
      console.log('');
    });
    
    // Check payments with receipts
    const paymentsWithReceipts = payments.filter(p => p.receipt_file_url);
    console.log(`📎 Payments with receipts: ${paymentsWithReceipts.length}\n`);
    
    if (paymentsWithReceipts.length > 0) {
      paymentsWithReceipts.forEach((payment, index) => {
        console.log(`Receipt ${index + 1}:`);
        console.log(`  Payment ID: ${payment.id}`);
        console.log(`  Receipt URL: ${payment.receipt_file_url}`);
        console.log('');
      });
    }
    
    // Check database schema
    console.log('🔧 Checking payments table schema...\n');
    
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;
    
    console.log('Payments table columns:');
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging payment receipts:', error);
  } finally {
    await sql.end();
  }
}

debugPaymentReceipts(); 