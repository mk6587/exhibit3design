
import React, { useRef, useState, useEffect } from 'react';

interface ImageHoverProps {
  sketchSrc: string;
  renderedSrc: string;
  alt: string;
  className?: string;
  gridSize?: number;
}

const ImageHover: React.FC<ImageHoverProps> = ({ 
  sketchSrc, 
  renderedSrc, 
  alt, 
  className = "", 
  gridSize = 20 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixels, setPixels] = useState<Array<{x: number, y: number, width: number, height: number}>>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width, height });
          
          const pixelWidth = width / gridSize;
          const pixelHeight = height / gridSize;
          
          const newPixels = [];
          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              newPixels.push({
                x: x * pixelWidth,
                y: y * pixelHeight,
                width: pixelWidth,
                height: pixelHeight
              });
            }
          }
          setPixels(newPixels);
        }
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [gridSize]);
  
  return (
    <div ref={containerRef} className={`image-hover-container ${className}`}>
      <img src={sketchSrc} alt={alt} className="sketch-image" />
      
      <div className="pixel-container">
        {pixels.map((pixel, index) => (
          <div 
            key={index} 
            className="pixel"
            style={{
              gridColumn: `span 1`,
              gridRow: `span 1`
            }}
          >
            <div 
              className="pixel-sketch"
              style={{
                backgroundImage: `url(${sketchSrc})`,
                backgroundSize: `${containerDimensions.width}px ${containerDimensions.height}px`,
                backgroundPosition: `-${pixel.x}px -${pixel.y}px`
              }}
            />
            <div 
              className="pixel-rendered"
              style={{
                backgroundImage: `url(${renderedSrc})`,
                backgroundSize: `${containerDimensions.width}px ${containerDimensions.height}px`,
                backgroundPosition: `-${pixel.x}px -${pixel.y}px`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHover;
