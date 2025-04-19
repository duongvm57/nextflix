'use client';

import { useEffect, useRef } from 'react';
import type Hls from 'hls.js';
import { playerConfig } from '@/lib/config/player';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const setupHls = async () => {
      try {
        // Dynamic import Hls only when needed
        const { default: HlsPlayer } = await import('hls.js');

        if (HlsPlayer.isSupported()) {
          hls = new HlsPlayer({
            maxBufferLength: playerConfig.hls.maxBufferLength,
            maxMaxBufferLength: playerConfig.hls.maxMaxBufferLength,
            maxBufferSize: playerConfig.hls.maxBufferSize,
            maxBufferHole: playerConfig.hls.maxBufferHole,
            lowLatencyMode: playerConfig.hls.lowLatencyMode,
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => {
            video.play().catch(error => {
              console.error('Error attempting to play video:', error);
            });
          });

          hls.on(HlsPlayer.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case HlsPlayer.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...');
                  hls?.startLoad();
                  break;
                case HlsPlayer.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...');
                  hls?.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, destroying HLS instance:', data);
                  hls?.destroy();
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari, which has native HLS support
          video.src = src;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(error => {
              console.error('Error attempting to play video:', error);
            });
          });
        } else {
          console.error('HLS is not supported in this browser and no native support available');
        }
      } catch (error) {
        console.error('Error initializing HLS:', error);
      }
    };

    setupHls();

    return () => {
      if (hls) {
        hls.destroy();
      }

      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={`w-full h-full ${className}`}
      poster={poster}
      playsInline
      preload="auto"
      controls
    />
  );
}
