import type { Handler, HandlerEvent } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent) => {
  const { station } = event.queryStringParameters || {};

  if (!station) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Station parameter required' }),
    };
  }

  // Map station names to stream URLs
  const streamMap: Record<string, string> = {
    mainstage: 'http://72.62.61.67/hls/fastfit_mainstage/live.m3u8',
    afro: 'http://72.62.61.67/hls/fastfit_afro/live.m3u8',
    classics: 'http://72.62.61.67/hls/fastfit_classics/live.m3u8',
    chill: 'http://72.62.61.67/hls/fastfit_chill/live.m3u8',
    organic: 'http://72.62.61.67/hls/fastfit_organic/live.m3u8',
    house: 'http://72.62.61.67/hls/fastfit_house/live.m3u8',
  };

  const streamUrl = streamMap[station.toLowerCase()];

  if (!streamUrl) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Station not found' }),
    };
  }

  try {
    // Fetch the stream from HTTP endpoint
    const response = await fetch(streamUrl);
    const data = await response.text();

    // Return the stream content with proper headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/x-mpegurl',
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  } catch (error) {
    console.error('Stream proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch stream' }),
    };
  }
};
