async function test() {
  const url = 'https://www.instagram.com/reels/C6-Y_4vy9-2/'; 
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      }
    });
    const html = await res.text();
    console.log(`Status: ${res.status}`);
    
    // Look for ld+json
    const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (ldJsonMatch) {
      console.log('Found ld+json');
      console.log(ldJsonMatch[1].substring(0, 200));
    }

    // Look for __additionalDataLoaded
    const addDataMatch = html.match(/window\.__additionalDataLoaded\('feed',([\s\S]*?)\);/);
    if (addDataMatch) {
        console.log('Found __additionalDataLoaded');
        console.log(addDataMatch[1].substring(0, 200));
    }

    // Look for _sharedData
    const sharedDataMatch = html.match(/window\._sharedData = ([\s\S]*?);<\/script>/);
    if (sharedDataMatch) {
        console.log('Found _sharedData');
        console.log(sharedDataMatch[1].substring(0, 200));
    }

    // Look for any large JSON-like string in scripts
    const scriptMatches = html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/g);
    for (const match of scriptMatches) {
        const content = match[1];
        if (content.includes('video_url') || content.includes('display_url')) {
            console.log('Found script with media URLs!');
            console.log(content.substring(content.indexOf('video_url') - 50, content.indexOf('video_url') + 200));
        }
    }

  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

test();
