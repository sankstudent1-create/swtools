async function test() {
  const shortcode = 'C6-Y_4vy9-2';
  const queryHash = 'b305391d097a82b47e7d15853005b651'; // Hash for media details
  const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify({ shortcode }))}`;
  
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `https://www.instagram.com/reels/${shortcode}/`,
      }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data).substring(0, 500));
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

test();
