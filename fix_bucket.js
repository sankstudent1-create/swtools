require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBucket() {
  console.log('Checking bucket: topup-screenshots...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const exists = buckets.find(b => b.name === 'topup-screenshots');
  
  if (!exists) {
    console.log('Bucket does not exist. Creating...');
    const { error: createError } = await supabase.storage.createBucket('topup-screenshots', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (createError) console.error('Error creating bucket:', createError);
    else console.log('Bucket created successfully!');
  } else {
    console.log('Bucket already exists.');
    // Ensure it is public
    const { error: updateError } = await supabase.storage.updateBucket('topup-screenshots', {
      public: true
    });
    if (updateError) console.error('Error updating bucket:', updateError);
    else console.log('Bucket set to public.');
  }
}

fixBucket();
