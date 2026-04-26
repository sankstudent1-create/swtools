const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let url, serviceKey;

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = line.split('=')[1].trim();
}

console.log('URL:', url ? 'FOUND' : 'NOT FOUND');
console.log('KEY:', serviceKey ? 'FOUND' : 'NOT FOUND');

if (!url || !serviceKey) {
  console.log('Retrying with .env if exists...');
  try {
    const envContent2 = fs.readFileSync('.env', 'utf8');
    const lines2 = envContent2.split('\n');
    for (const line of lines2) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = line.split('=')[1].trim();
    }
  } catch (e) {}
}

const supabase = createClient(url, serviceKey);

async function test() {
  console.log('Testing DB Insert...');
  const { data, error } = await supabase.from('manual_topup_requests').insert({
    user_id: '861a8685-643c-449e-8798-202ba4025178', 
    amount_inr: 1,
    credits_requested: 1,
    utr: 'test_utr_' + Date.now(),
    status: 'pending'
  }).select();

  if (error) {
    console.error('Insert Failed:', error.message, error.code);
  } else {
    console.log('Insert Success:', data);
  }
}
test();
