import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeVideo?: string;
  afterVideo?: string;
  mode: string;
}

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeVideo,
  afterVideo,
  mode,
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className="relative w-full">
      {/* Mode badge */}
      <div className="flex justify-center mb-3 md:mb-4">
        <Badge 
          variant="outline" 
          className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium border-primary/50 bg-primary/5"
        >
          Visitors Walkthrough Video
        </Badge>
      </div>

      {/* Before/After container */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize select-none"
      >
        {/* After image/video (full background) */}
        <div className="absolute inset-0">
          {afterVideo ? (
            <video
              src={afterVideo}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={afterImage}
              alt="AI transformed design"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Before image/video (clipped) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          {beforeVideo ? (
            <video
              src={beforeVideo}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={beforeImage}
              alt="Original design"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Slider line and handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider handle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="flex gap-1">
              <div className="w-0.5 h-4 bg-gray-400"></div>
              <div className="w-0.5 h-4 bg-gray-400"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6">
          <Badge variant="secondary" className="backdrop-blur-sm bg-black/50 text-white border-0 text-xs md:text-sm">
            Original
          </Badge>
        </div>
        <div className="absolute bottom-3 md:bottom-6 right-3 md:right-6">
          <Badge 
            className="backdrop-blur-sm border-0 text-xs md:text-sm text-white"
            style={{ backgroundColor: "#8E44FF" }}
          >
            AI Result
          </Badge>
        </div>
      </div>
    </div>
  );
};
