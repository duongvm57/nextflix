'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { playerConfig } from '@/lib/config/player';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const setupHls = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: playerConfig.hls.maxBufferLength,
          maxMaxBufferLength: playerConfig.hls.maxMaxBufferLength,
          maxBufferSize: playerConfig.hls.maxBufferSize,
          maxBufferHole: playerConfig.hls.maxBufferHole,
          lowLatencyMode: playerConfig.hls.lowLatencyMode,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(error => {
            console.error('Error attempting to play video:', error);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
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
