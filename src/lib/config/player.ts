/**
 * Player configuration
 * This file contains configuration for the video player
 */

// Player source type
export type PlayerSourceType = 'embed' | 'm3u8';

// Player configuration
export const playerConfig = {
  // Default source type (embed or m3u8)
  // Change this to 'm3u8' to use HLS player instead of embed
  defaultSourceType: 'embed' as PlayerSourceType,

  // HLS configuration
  hls: {
    // Maximum buffer length in seconds
    maxBufferLength: 30,

    // Maximum maximum buffer length in seconds
    maxMaxBufferLength: 60,

    // Maximum buffer size in bytes (60MB)
    maxBufferSize: 60 * 1000 * 1000,

    // Maximum buffer hole in seconds
    maxBufferHole: 0.5,

    // Enable low latency mode
    lowLatencyMode: true,
  },
};
