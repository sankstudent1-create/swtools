import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // Identify URL type and Extract ID
    let type: 'video' | 'playlist' | 'channel' = 'video';
    let id = '';

    const videoMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const playlistMatch = url.match(/[?&]list=([^#&?]+)/);
    const channelMatch = url.match(/(?:youtube\.com\/(?:c\/|channel\/|user\/|@))([^\/\n\s\?]+)/);

    if (playlistMatch) {
      type = 'playlist';
      id = playlistMatch[1];
    } else if (channelMatch) {
      type = 'channel';
      id = channelMatch[1];
    } else if (videoMatch) {
      type = 'video';
      id = videoMatch[1];
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    if (type === 'video') {
      const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${id}&key=${apiKey}`);
      const videoData = await videoRes.json();
      if (!videoData.items?.[0]) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      
      const item = videoData.items[0];
      const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${item.snippet.channelId}&key=${apiKey}`);
      const channelData = await channelRes.json();

      return NextResponse.json({
        type: 'video',
        id,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        tags: item.snippet.tags || [],
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        duration: item.contentDetails.duration,
        channel: {
          title: channelData.items[0].snippet.title,
          subscriberCount: channelData.items[0].statistics.subscriberCount,
          thumbnails: channelData.items[0].snippet.thumbnails,
        }
      });
    }

    if (type === 'playlist') {
      const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&id=${id}&key=${apiKey}`);
      const playlistData = await playlistRes.json();
      if (!playlistData.items?.[0]) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
      
      const item = playlistData.items[0];
      return NextResponse.json({
        type: 'playlist',
        id,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        itemCount: item.contentDetails.itemCount,
        channelTitle: item.snippet.channelTitle,
        tags: [], // Playlists don't have tags in the same way
      });
    }

    if (type === 'channel') {
      // Handle both ID and Handle (@)
      let channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,contentDetails&key=${apiKey}`;
      if (id.startsWith('@')) {
        channelUrl += `&forHandle=${id.substring(1)}`;
      } else if (id.length === 24 && id.startsWith('UC')) {
        channelUrl += `&id=${id}`;
      } else {
        channelUrl += `&forHandle=${id}`; // Try handle first
      }

      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();
      if (!channelData.items?.[0]) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

      const item = channelData.items[0];
      return NextResponse.json({
        type: 'channel',
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        subscriberCount: item.statistics.subscriberCount,
        viewCount: item.statistics.viewCount,
        videoCount: item.statistics.videoCount,
        customUrl: item.snippet.customUrl,
        tags: [],
      });
    }

  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
