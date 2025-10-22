import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useProtectedExternalLink } from "@/hooks/useProtectedExternalLink";
import LazyImage from "@/components/performance/LazyImage";
export const HeroSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const {
    navigateToProtectedLink
  } = useProtectedExternalLink();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/videos-public/exhibit_hp_video.mp4";
  const posterUrl = "https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/1.jpg";
  const hasVideo = true;
  const aiStudioUrl = "https://ai.exhibit3design.com/?service=rotate-360";
  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  // Load video after poster loads (both mobile and desktop)
  useEffect(() => {
    if (posterLoaded) {
      // Short delay after poster loads to ensure smooth transition
      const timer = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [posterLoaded]);
  return <section ref={sectionRef} className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-secondary">
      {hasVideo && videoUrl ? <>
          <img src={posterUrl} alt="Exhibition Stand Hero" width={1920} height={600} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" style={{
        opacity: videoLoaded ? 0 : 1,
        pointerEvents: videoLoaded ? 'none' : 'auto'
      }} onLoad={() => setPosterLoaded(true)} onError={() => setPosterError(true)} />
          
          {shouldLoadVideo && <video ref={videoRef} className="w-full h-full object-cover transition-opacity duration-500" style={{
        opacity: videoLoaded ? 1 : 0
      }} autoPlay loop muted playsInline preload="none" onCanPlayThrough={handleVideoCanPlay} onLoadedData={() => {
        console.log('Video loaded and ready');
      }} onError={e => {
        console.error('Video loading error:', e);
      }}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>}
          
          <div className="absolute inset-0 bg-black/20" />
          
          {posterError && !posterLoaded && <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-700" />}
        </> : <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&crop=center&auto=format&q=80")`
    }}>
          <div className="absolute inset-0 bg-black/30" />
        </div>}
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 0, 0, 0.6)'
        }}>Your Booth Design Can Spin Like This — in One Click</h1>
          
          <p className="text-base md:text-lg font-normal mb-6" style={{
          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 0, 0, 0.6)'
        }}>
            Download 3D booth designs and transform them with AI: 360° videos, photorealistic renders, instant customization
          </p>
          
          <div className="flex justify-center">
            <Button size="lg" variant="outline" className="bg-purple-600/40 text-white border-purple-400/70 hover:bg-purple-600/50" onClick={() => navigateToProtectedLink(aiStudioUrl)}>
              Create with AI Now
            </Button>
          </div>
          {!hasVideo && <div className="text-sm text-white/80 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm mt-4">
              💡 Upload a video to the videos storage bucket to replace this image
            </div>}
        </div>
      </div>
    </section>;
};