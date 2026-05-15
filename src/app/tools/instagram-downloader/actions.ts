"use server";

export async function fetchInstagramMedia(url: string) {
  if (!url.includes('instagram.com')) {
    throw new Error('Please enter a valid Instagram URL.');
  }

  try {
    // Try OEmbed first for metadata
    const encodedUrl = encodeURIComponent(url);
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodedUrl}`;
    
    // Add a basic User-Agent to avoid some simple bot blocks
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      return { error: 'Failed to fetch Instagram metadata. Make sure the post is public or not age-restricted.' };
    }

    const data = await res.json();
    
    return {
      success: true,
      data: {
        title: data.title || "Instagram Post",
        author_name: data.author_name,
        author_url: data.author_url,
        thumbnail_url: data.thumbnail_url,
        html: data.html,
      }
    };
  } catch (error: any) {
    console.error('Instagram Fetch Error:', error);
    return { error: error.message || 'An error occurred while connecting to Instagram. Please try again later.' };
  }
}
