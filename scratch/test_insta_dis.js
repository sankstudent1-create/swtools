async function test() {
  const shortcode = 'C6-Y_4vy9-2';
  const url = `https://www.instagram.com/reels/${shortcode}/?__a=1&__d=dis`;
  
  try {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'X-IG-App-ID': '936619743392459', // This is the common Instagram Web App ID
      }
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(text.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
