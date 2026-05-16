async function test() {
  const url = 'https://www.instagram.com/reels/C6-Y_4vy9-2/'; 
  const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': mobileUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`HTML contains og:video: ${html.includes('og:video')}`);
    console.log(`HTML contains video_url: ${html.includes('video_url')}`);
    
    if (html.includes('og:video')) {
       const match = html.match(/property="og:video" content="([^"]+)"/);
       console.log(`Found og:video: ${match ? match[1] : 'null'}`);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

test();
