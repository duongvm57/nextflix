'use client';

import { useEffect, useState } from 'react';

interface EmbedClientProps {
  src: string;
}

export function EmbedClient({ src }: EmbedClientProps) {
  // Use a state to ensure the iframe is only rendered on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-full w-full bg-black flex items-center justify-center">Loading player...</div>;
  }

  return (
    <iframe
      src={src}
      className="h-full w-full border-0"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      loading="lazy"
      title="Video Player"
    />
  );
}
