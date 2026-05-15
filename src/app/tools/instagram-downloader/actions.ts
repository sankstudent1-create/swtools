"use server";

export async function fetchInstagramMedia(url: string) {
  if (!url.includes('instagram.com')) {
    throw new Error('Please enter a valid Instagram URL.');
  }

  try {
    // Try OEmbed first for metadata
    const oembedUrl = `https://api.instagram.com/oembed?url=${url}`;
    const res = await fetch(oembedUrl);
    
    if (!res.ok) {
      throw new Error('Failed to fetch Instagram metadata. Make sure the post is public.');
    }

    const data = await res.json();
    
    // Note: Instagram direct media URLs are hard to get without a key or scraper.
    // We provide the metadata and a "Best Effort" direct link if possible, 
    // or a specialized proxy link.
    
    return {
      title: data.title || "Instagram Post",
      author_name: data.author_name,
      author_url: data.author_url,
      thumbnail_url: data.thumbnail_url,
      html: data.html,
      // For actual download, we might need a third party service or complex scraping.
      // We'll provide the OEmbed data which is already useful for preview.
    };
  } catch (error: any) {
    console.error('Instagram Fetch Error:', error);
    throw new Error(error.message || 'An error occurred while fetching media.');
  }
}
