async function test() {
  const shortcode = 'C6-Y_4vy9-2';
  const BASE_URL = "https://www.instagram.com/graphql/query"
  const INSTAGRAM_DOCUMENT_ID = "9510064595728286"
  
  try {
    // 1. Get CSRF Token
    console.log('Fetching CSRF token...');
    const homeRes = await fetch('https://www.instagram.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const setCookie = homeRes.headers.get('set-cookie');
    if (!setCookie) throw new Error('No set-cookie header');
    
    const csrfMatch = setCookie.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;
    if (!csrfToken) throw new Error('CSRF token not found');
    console.log('CSRF Token:', csrfToken);

    // 2. Make GraphQL Request
    console.log('Making GraphQL request...');
    const variables = JSON.stringify({
      shortcode: shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null
    });
    
    const body = new URLSearchParams();
    body.append('variables', variables);
    body.append('doc_id', INSTAGRAM_DOCUMENT_ID);

    const gqlRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://www.instagram.com/reels/${shortcode}/`,
        'Cookie': `csrftoken=${csrfToken}`,
      },
      body: body.toString()
    });

    const data = await gqlRes.json();
    console.log('Status:', gqlRes.status);
    if (data.data?.xdt_shortcode_media) {
        console.log('SUCCESS! Found media data.');
        const media = data.data.xdt_shortcode_media;
        console.log('Type:', media.__typename);
        console.log('Is Video:', media.is_video);
        if (media.is_video) console.log('Video URL:', media.video_url.substring(0, 100) + '...');
        else console.log('Display URL:', media.display_url.substring(0, 100) + '...');
    } else {
        console.log('FAILED to find media data.');
        console.log(JSON.stringify(data).substring(0, 500));
    }

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
