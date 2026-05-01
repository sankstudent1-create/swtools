import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Extract Video ID
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // Fetch video details
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
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
