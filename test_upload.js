const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.trim();

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('--- STORAGE BUCKET TEST ---');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('FAILED to list buckets:', bError.message);
  } else {
    console.log('Buckets found:', buckets.map(b => b.name).join(', '));
    const exists = buckets.find(b => b.name === 'topup-screenshots');
    console.log('topup-screenshots bucket exists:', !!exists);
    if (exists) console.log('Bucket is public:', exists.public);
  }

  console.log('\n--- TABLE PERMISSION TEST ---');
  const { data: tableData, error: tError } = await supabase.from('manual_topup_requests').select('*').limit(0);
  if (tError) {
    console.error('FAILED to access manual_topup_requests:', tError.message, tError.code);
  } else {
    console.log('Successfully connected to manual_topup_requests table');
  }
}

test();
