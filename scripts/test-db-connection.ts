import { Client } from 'pg';

const client = new Client({
  host: 'db.uuxlmvpvwdavtftrjzzj.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwertyuiop@1234567890',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL!\n');
    
    // Test query 1: Get current time
    console.log('📊 Running test queries...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', timeResult.rows[0].current_time);
    
    // Test query 2: List all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\n📋 Tables in database:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test query 3: Check if profiles table exists and count rows
    try {
      const countResult = await client.query('SELECT COUNT(*) as count FROM profiles');
      console.log(`\n👥 Profiles table has ${countResult.rows[0].count} rows`);
    } catch (err) {
      console.log('\n⚠️  Profiles table might not exist or no access');
    }
    
    // Test query 4: Check if projects table exists and count rows
    try {
      const countResult = await client.query('SELECT COUNT(*) as count FROM projects');
      console.log(`📁 Projects table has ${countResult.rows[0].count} rows`);
    } catch (err) {
      console.log('⚠️  Projects table might not exist or no access');
    }
    
    await client.end();
    console.log('\n✅ Connection test completed successfully!');
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) {
      console.error(`Error code: ${err.code}`);
    }
    process.exit(1);
  }
}

testConnection();

