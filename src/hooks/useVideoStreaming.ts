import { useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

interface UseVideoStreamingProps {
  mp4Url: string;
  hlsUrl?: string;
  autoPlay?: boolean;
}

interface VideoStreamingState {
  isLoading: boolean;
  hasError: boolean;
  isHlsSupported: boolean;
  streamingUrl: string;
  quality: string;
  availableQualities: string[];
}

export const useVideoStreaming = ({ 
  mp4Url, 
  hlsUrl, 
  autoPlay = false 
}: UseVideoStreamingProps) => {
  const [state, setState] = useState<VideoStreamingState>({
    isLoading: true,
    hasError: false,
    isHlsSupported: false,
    streamingUrl: mp4Url,
    quality: 'auto',
    availableQualities: [],
  });

  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);

  // Check HLS support
  useEffect(() => {
    const isHlsSupported = Hls.isSupported() || 
      (typeof document !== 'undefined' && 
       document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '');
    
    setState(prev => ({
      ...prev,
      isHlsSupported,
      streamingUrl: (isHlsSupported && hlsUrl) ? hlsUrl : mp4Url,
    }));
  }, [mp4Url, hlsUrl]);

  const initializeHls = useCallback((videoElement: HTMLVideoElement) => {
    if (!state.isHlsSupported || !hlsUrl) {
      return null;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      startLevel: -1, // Auto quality selection
      capLevelToPlayerSize: true,
    });

    // Event listeners
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const qualities = data.levels.map((level: any, index: number) => {
        if (level.height) {
          return `${level.height}p`;
        } else if (level.bitrate) {
          return `${Math.round(level.bitrate / 1000)}kbps`;
        }
        return `Level ${index + 1}`;
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        availableQualities: ['auto', ...qualities],
      }));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data);
      
      if (data.fatal) {
        setState(prev => ({ ...prev, hasError: true, isLoading: false }));
        
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Fatal network error');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Fatal media error');
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      }
    });

    hls.loadSource(hlsUrl);
    hls.attachMedia(videoElement);
    setHlsInstance(hls);

    return hls;
  }, [state.isHlsSupported, hlsUrl]);

  const changeQuality = useCallback((qualityIndex: number) => {
    if (hlsInstance) {
      hlsInstance.currentLevel = qualityIndex === 0 ? -1 : qualityIndex - 1;
      setState(prev => ({
        ...prev,
        quality: prev.availableQualities[qualityIndex] || 'auto',
      }));
    }
  }, [hlsInstance]);

  const cleanup = useCallback(() => {
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }
  }, [hlsInstance]);

  return {
    ...state,
    initializeHls,
    changeQuality,
    cleanup,
    hlsInstance,
  };
};