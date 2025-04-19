'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { playerConfig } from '@/lib/config/player';

// Sử dụng dynamic import để tránh lỗi khi build
const Hls = dynamic(() => import('hls.js'), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Kiểm tra xem có đang chạy trên client không
    if (typeof window === 'undefined') return;

    const video = videoRef.current;
    if (!video) return;

    let hls = null;

    const setupHls = async () => {
      // Kiểm tra xem Hls có tồn tại không
      if (!Hls) {
        console.error('HLS.js module not loaded');
        return;
      }

      // Kiểm tra xem Hls có hỗ trợ không
      if (Hls.isSupported && Hls.isSupported()) {
        try {
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
        } catch (error) {
          console.error('Error initializing HLS:', error);
        }
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
  }, [src, Hls]);

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
