async function test() {
  const shortcode = 'C6-Y_4vy9-2';
  const url = `https://www.instagram.com/reels/${shortcode}/`;
  
  try {
    console.log(`Fetching ${url} as facebookexternalhit...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    const html = await res.text();
    console.log(`Status: ${res.status}`);
    
    // Find all og:video tags
    const ogVideo = html.match(/property="og:video" content="([^"]+)"/);
    const ogImage = html.match(/property="og:image" content="([^"]+)"/);
    const ogTitle = html.match(/property="og:title" content="([^"]+)"/);

    console.log('Title:', ogTitle ? ogTitle[1] : 'Not found');
    console.log('Video:', ogVideo ? ogVideo[1].substring(0, 50) + '...' : 'Not found');
    console.log('Image:', ogImage ? ogImage[1].substring(0, 50) + '...' : 'Not found');

    if (ogVideo) {
        console.log('SUCCESS! Found video via Facebook scraper UA.');
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
