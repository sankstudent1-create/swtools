import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Extract Video ID with a more robust regex
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const videoIdMatch = url.match(regex);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      console.error('Failed to extract videoId from URL:', url);
      return NextResponse.json({ error: 'Invalid YouTube URL format' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // Fetch video details
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
    const videoResponse = await fetch(videoUrl);
    const videoData = await videoResponse.json();

    if (videoData.error) {
      console.error('YouTube API Error (Video):', videoData.error);
      return NextResponse.json({ error: videoData.error.message }, { status: videoData.error.code || 500 });
    }

    if (!videoData.items || videoData.items.length === 0) {
      console.error('No video found for ID:', videoId);
      return NextResponse.json({ error: 'Video not found. Please check if it is public.' }, { status: 404 });
    }

    const videoItem = videoData.items[0];
    const channelId = videoItem.snippet.channelId;

    // Fetch channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelResponse.json();
    const channelItem = channelData.items[0];

    const stats = {
      id: videoId,
      title: videoItem.snippet.title,
      description: videoItem.snippet.description,
      publishedAt: videoItem.snippet.publishedAt,
      thumbnails: videoItem.snippet.thumbnails,
      tags: videoItem.snippet.tags || [],
      categoryId: videoItem.snippet.categoryId,
      duration: videoItem.contentDetails.duration,
      viewCount: videoItem.statistics.viewCount,
      likeCount: videoItem.statistics.likeCount,
      commentCount: videoItem.statistics.commentCount,
      channel: {
        id: channelId,
        title: channelItem.snippet.title,
        customUrl: channelItem.snippet.customUrl,
        subscriberCount: channelItem.statistics.subscriberCount,
        thumbnails: channelItem.snippet.thumbnails,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('YouTube Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch video statistics' }, { status: 500 });
  }
}
