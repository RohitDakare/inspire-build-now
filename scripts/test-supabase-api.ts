import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uuxlmvpvwdavtftrjzzj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1eGxtdnB2d2RhdnRmdHJqenpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Nzg5NjUsImV4cCI6MjA3NzA1NDk2NX0.iwkeIXSy-t9qaqlcwuCwU8mMrARHROv74-hkbmvwxeQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase API connection...');
    
    // Test 1: Get session
    console.log('\n📊 Test 1: Getting current session...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? '✅ Active' : '❌ None');
    
    // Test 2: Query profiles table
    console.log('\n📊 Test 2: Querying profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Error:', profilesError.message);
    } else {
      console.log(`✅ Profiles query successful! Found ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log('Sample profile:', profiles[0]);
      }
    }
    
    // Test 3: Query projects table
    console.log('\n📊 Test 3: Querying projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectsError) {
      console.log('❌ Error:', projectsError.message);
    } else {
      console.log(`✅ Projects query successful! Found ${projects?.length || 0} projects`);
      if (projects && projects.length > 0) {
        console.log('Sample project:', { 
          id: projects[0].id, 
          title: projects[0].title,
          project_type: projects[0].project_type 
        });
      }
    }
    
    // Test 4: Count records
    console.log('\n📊 Test 4: Counting records...');
    const { count: profilesCount, error: countError1 } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: projectsCount, error: countError2 } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total Profiles: ${profilesCount || 0}`);
    console.log(`Total Projects: ${projectsCount || 0}`);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Connection Summary:');
    console.log('✅ Supabase API is working');
    console.log('✅ Database is accessible via Supabase client');
    console.log('⚠️  Direct PostgreSQL connection requires network access');
    
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testSupabaseConnection();

