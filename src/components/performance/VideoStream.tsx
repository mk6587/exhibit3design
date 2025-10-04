import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoStreamProps {
  src: string;
  hlsUrl?: string;
  poster?: string;
  fallbackImage?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  priority?: boolean; // New: Skip lazy loading for critical videos
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: any) => void;
  style?: React.CSSProperties;
}

export const VideoStream = ({
  src,
  hlsUrl,
  poster,
  fallbackImage,
  className = "",
  autoPlay = false,
  muted = true,
  loop = true,
  playsInline = true,
  priority = false, // Default to lazy loading
  onLoadStart,
  onLoadedData,
  onError,
  style,
}: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority); // Start immediately if priority

  // Intersection Observer for lazy loading (skip if priority)
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority videos
    
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(video);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    onLoadedData?.();
  }, [onLoadedData]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
    console.error('Video streaming error:', error);
  }, [onError]);

  // Initialize HLS streaming
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isIntersecting) return;

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = hlsUrl || src;

    // Check if HLS is supported
    if (Hls.isSupported() && (hlsUrl || streamUrl.includes('.m3u8'))) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1, // Auto quality selection
        capLevelToPlayerSize: true,
      });

      hlsRef.current = hls;

      // HLS event handlers
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        // Media attached successfully
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        handleLoadedData();
        
        if (autoPlay) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay prevented by browser
            });
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              handleError(data);
              break;
          }
        }
      });

      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        setIsLoading(false);
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      handleLoadStart();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      handleLoadStart();
      
      if (autoPlay) {
        video.addEventListener('loadeddata', () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay prevented by browser
            });
          }
        }, { once: true });
      }
    } else {
      // Fallback to regular MP4
      video.src = src;
      
      if (autoPlay) {
        video.addEventListener('loadeddata', () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay prevented by browser
            });
          }
        }, { once: true });
      }
    }

    // Video event listeners (avoid duplicate handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isIntersecting, src, hlsUrl, autoPlay, handleLoadStart, handleLoadedData, handleError]);

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error state - show fallback image or error overlay */}
      {hasError && (
        <>
          {fallbackImage ? (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-10"
              style={{ backgroundImage: `url("${fallbackImage}")` }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center z-10">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">Failed to load video</p>
              </div>
            </div>
          )}
        </>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full ${className}`}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={priority || autoPlay ? 'auto' : 'metadata'}
        style={style}
      >
        {!isIntersecting && !priority && (
          <source src={src} type="video/mp4" />
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  );
};