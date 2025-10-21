import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  onLoad?: () => void;
}

const LazyVideo = ({
  src,
  poster,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  onLoad,
}: LazyVideoProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, that's okay
      });
    }
  }, [shouldLoad, autoPlay]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <video
      ref={videoRef}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-70',
        className
      )}
      poster={poster}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload="metadata"
      onLoadedData={handleLoadedData}
    >
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  );
};

export default LazyVideo;
