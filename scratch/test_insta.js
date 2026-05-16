async function test() {
  const url = 'https://www.instagram.com/reels/C6-Y_4vy9-2/'; // Replace with a known public reel
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Twitterbot/1.0',
    'Googlebot/2.1 (+http://www.google.com/bot.html)'
  ];

  for (const ua of userAgents) {
    console.log(`Testing with UA: ${ua}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      const html = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`HTML contains og:video: ${html.includes('og:video')}`);
      console.log(`HTML contains og:image: ${html.includes('og:image')}`);
      if (html.includes('og:video')) {
          const match = html.match(/property="og:video" content="([^"]+)"/);
          console.log(`Found og:video: ${match ? match[1].substring(0, 50) + '...' : 'null'}`);
      }
      console.log('---');
    } catch (e) {
      console.error(`Error with UA ${ua}: ${e.message}`);
    }
  }
}

test();
