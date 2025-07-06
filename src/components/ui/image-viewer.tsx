
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(0.5); // Changed from 1 to 0.5 (50%)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      resetView();
    }
  }, [isOpen, currentIndex]);

  // Update container size on resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    if (isOpen) {
      updateContainerSize();
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
    }
  }, [isOpen]);

  const resetView = () => {
    // Calculate optimal scale to fit the entire image
    if (imageSize.width && imageSize.height && containerSize.width && containerSize.height) {
      const scaleToFitWidth = containerSize.width / imageSize.width;
      const scaleToFitHeight = containerSize.height / imageSize.height;
      const optimalScale = Math.min(scaleToFitWidth, scaleToFitHeight, 1); // Don't exceed 100%
      setScale(Math.max(optimalScale, 0.25)); // Minimum 25% scale
    } else {
      setScale(0.8); // Default to 80% if sizes not available
    }
    setPosition({ x: 0, y: 0 });
  };

  const handleImageLoad = () => {
    if (imageRef.current && containerSize.width && containerSize.height) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      
      // Calculate the display size to fit the image properly in the container
      const containerAspectRatio = containerSize.width / containerSize.height;
      const imageAspectRatio = naturalWidth / naturalHeight;
      
      let displayWidth, displayHeight;
      
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider relative to container, fit to width with some padding
        displayWidth = containerSize.width * 0.9;
        displayHeight = displayWidth / imageAspectRatio;
      } else {
        // Image is taller relative to container, fit to height with some padding
        displayHeight = containerSize.height * 0.9;
        displayWidth = displayHeight * imageAspectRatio;
      }
      
      setImageSize({ width: displayWidth, height: displayHeight });
      
      // Auto-reset view to show full image after size calculation
      setTimeout(() => {
        const scaleToFitWidth = containerSize.width / displayWidth;
        const scaleToFitHeight = containerSize.height / displayHeight;
        const optimalScale = Math.min(scaleToFitWidth, scaleToFitHeight, 1);
        setScale(Math.max(optimalScale * 0.9, 0.25)); // 90% of optimal with padding
        setPosition({ x: 0, y: 0 });
      }, 50);
    }
  };

  const canDragImage = () => {
    // Allow dragging when scale is above 50%, regardless of image size vs container size
    return scale > 0.5;
  };

  const constrainPosition = (newX: number, newY: number, currentScale: number) => {
    // Allow free movement when scale > 0.5, with reasonable bounds
    if (currentScale > 0.5) {
      const scaledImageWidth = imageSize.width * currentScale;
      const scaledImageHeight = imageSize.height * currentScale;
      
      // Set reasonable movement bounds - allow moving beyond container edges
      const maxX = Math.max(containerSize.width * 0.3, (scaledImageWidth - containerSize.width) / 2);
      const maxY = Math.max(containerSize.height * 0.3, (scaledImageHeight - containerSize.height) / 2);
      
      return {
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      };
    }
    
    return { x: 0, y: 0 };
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
    const constrainedPos = constrainPosition(position.x, position.y, newScale);
    setPosition(constrainedPos);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.25);
    setScale(newScale);
    const constrainedPos = constrainPosition(position.x, position.y, newScale);
    setPosition(constrainedPos);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (canDragImage()) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && canDragImage()) {
      e.preventDefault();
      e.stopPropagation();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const constrainedPos = constrainPosition(newX, newY, scale);
      setPosition(constrainedPos);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (canDragImage()) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && canDragImage()) {
      e.preventDefault();
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      const constrainedPos = constrainPosition(newX, newY, scale);
      setPosition(constrainedPos);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const newScale = Math.min(Math.max(scale * delta, 0.25), 3); // Changed from 0.5 to 0.25
    setScale(newScale);
    
    const constrainedPos = constrainPosition(position.x, position.y, newScale);
    setPosition(constrainedPos);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case '0':
        resetView();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex, scale]);

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] bg-white border shadow-xl p-0 overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>{title || 'Image Viewer'}</DialogTitle>
          <DialogDescription>
            Viewing {title || 'image'} - use zoom controls to magnify, arrow keys to navigate
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Fixed Header with title and image counter only */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {images.length > 1 && (
              <p className="text-sm text-gray-600">
                {currentIndex + 1} of {images.length}
              </p>
            )}
          </div>
        </div>

        {/* Fixed Image Container */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <div 
            ref={imageContainerRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Image Wrapper - Only this transforms */}
            <div
              className="relative flex items-center justify-center"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                cursor: canDragImage() ? (isDragging ? 'grabbing' : 'grab') : 'default',
                width: 'fit-content',
                height: 'fit-content'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <img
                ref={imageRef}
                src={images[currentIndex]}
                alt={`${title || 'Image'} ${currentIndex + 1}`}
                className="block max-w-none"
                style={{
                  height: 'auto',
                  width: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                draggable={false}
                onLoad={handleImageLoad}
              />
            </div>
            
            {/* Fixed Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-colors z-10"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-colors z-10"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Fixed Controls Footer */}
        <div className="flex justify-between items-center gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="flex justify-center items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.25} // Changed from 0.5 to 0.25
              className="text-gray-700"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Zoom Out
            </Button>
            
            <div className="text-gray-700 text-sm px-3 py-1 bg-gray-200 rounded">
              {Math.round(scale * 100)}%
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="text-gray-700"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom In
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="text-gray-700"
              aria-label="Reset view"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          
          {/* Close button moved to footer */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-gray-700"
            aria-label="Close"
          >
            Close
          </Button>
        </div>

        {/* Fixed Thumbnails */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-3 bg-gray-50 border-t flex-shrink-0 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors flex-shrink-0 ${
                  index === currentIndex ? 'border-blue-500' : 'border-gray-300 opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
