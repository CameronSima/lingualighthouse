const MAX_RESULTS = 50;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export interface Video {
  id: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  thumbnailUrl: string;
}

export async function getVideoById(videoId: string): Promise<Video> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log({ data, YOUTUBE_API_KEY });
  const video = data.items[0];
  return {
    id: video.id,
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    title: video.snippet.title,
    description: video.snippet.description,
    publishedAt: video.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailUrl: video.snippet.thumbnails.high.url,
  };
}

export async function getVideosFromPlaylistId(
  playlistId: string,
  pageToken: string | undefined
): Promise<{ videos: Video[]; nextPageToken: string | undefined }> {
  let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const response = await fetch(url);
  const dataJson = await response.json();
  const data = dataJson.items;
  const videos: Video[] = data.map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    thumbnailUrl: item.snippet.thumbnails.high.url,
  }));
  const nextPageToken = dataJson.nextPageToken as string | undefined;
  return { videos, nextPageToken };
}

export async function getChannelVideos(channelName: string) {
  let response: { videos: any[]; nextPageToken: string | undefined };
  let pageToken: string | undefined = undefined;
  const channelVideos: Video[] = [];
  const playlistId = channelName.replace("UC", "UU");

  while (true) {
    response = await getVideosFromPlaylistId(playlistId, pageToken);
    const { videos, nextPageToken } = response;
    channelVideos.push(...videos);
    pageToken = nextPageToken;
    if (!nextPageToken) {
      break;
    }
  }
  return channelVideos;
}

export async function getChannelIdFromUrl(url: string) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    const arr = data.split("channel_id=");
    const channelId = arr[1].slice(0, 24);
    console.log("Channel ID:", channelId);
    return channelId;
  } catch (error) {
    console.log(error);
  }
}

export async function getChannelVideoCount(channelId: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const videoCount = data.items[0].statistics.videoCount;
  return videoCount;
}
