'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { playerConfig } from '@/lib/config/player';

// Dynamically import the VideoPlayer component to ensure it only runs on the client
const VideoPlayer = dynamic(
  () => import('@/components/player/video-player').then((mod) => mod.VideoPlayer),
  { ssr: false }
);

interface PlayerClientProps {
  src: string;
  poster?: string;
  embedSrc: string;
}

export function PlayerClient({ src, poster, embedSrc }: PlayerClientProps) {
  // Always use embed source by default to avoid hydration issues
  // We can change this in the future when we implement settings
  const [useHLS, setUseHLS] = useState(false);

  // This effect is commented out to ensure we always use embed source
  // Uncomment this when implementing settings
  /*
  useEffect(() => {
    setUseHLS(playerConfig.defaultSourceType === 'm3u8');
  }, []);
  */

  return (
    <Suspense fallback={<div className="h-full w-full bg-black flex items-center justify-center">Loading player...</div>}>
      {useHLS && src ? (
        // HLS Player (when enabled in config)
        <VideoPlayer src={src} poster={poster} />
      ) : (
        // Embed Player (default)
        <iframe
          src={embedSrc}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )}
    </Suspense>
  );
}
