
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
  const [scale, setScale] = useState(0.5);
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
        console.log('Container size updated:', { width: rect.width, height: rect.height });
      }
    };

    if (isOpen) {
      updateContainerSize();
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
    }
  }, [isOpen]);

  const resetView = () => {
    console.log('Resetting view');
    setScale(0.5);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const { width: containerWidth, height: containerHeight } = containerSize;
      
      console.log('Image loaded:', { naturalWidth, naturalHeight, containerWidth, containerHeight });
      
      // Calculate the display size at scale 1
      const aspectRatio = naturalWidth / naturalHeight;
      let displayWidth, displayHeight;
      
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider, fit to height
        displayHeight = Math.min(containerHeight * 0.9, naturalHeight);
        displayWidth = displayHeight * aspectRatio;
      } else {
        // Container is taller, fit to width
        displayWidth = Math.min(containerWidth * 0.9, naturalWidth);
        displayHeight = displayWidth / aspectRatio;
      }
      
      setImageSize({ width: displayWidth, height: displayHeight });
      console.log('Image size set:', { width: displayWidth, height: displayHeight });
    }
  };

  const constrainPosition = (newX: number, newY: number, currentScale: number) => {
    if (currentScale <= 0.5) {
      console.log('Scale too low for constraints:', currentScale);
      return { x: 0, y: 0 };
    }
    
    const scaledImageWidth = imageSize.width * currentScale;
    const scaledImageHeight = imageSize.height * currentScale;
    
    const maxX = Math.max(0, (scaledImageWidth - containerSize.width) / 2);
    const maxY = Math.max(0, (scaledImageHeight - containerSize.height) / 2);
    
    const constrainedPos = {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    };
    
    console.log('Position constrained:', {
      input: { newX, newY },
      output: constrainedPos,
      constraints: { maxX, maxY },
      scaledImageSize: { scaledImageWidth, scaledImageHeight }
    });
    
    return constrainedPos;
  };

  const handleZoomIn = () => {
    console.log('Zoom in triggered, current scale:', scale);
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
    const constrainedPos = constrainPosition(position.x, position.y, newScale);
    setPosition(constrainedPos);
  };

  const handleZoomOut = () => {
    console.log('Zoom out triggered, current scale:', scale);
    const newScale = Math.max(scale / 1.2, 0.25);
    setScale(newScale);
    const constrainedPos = constrainPosition(position.x, position.y, newScale);
    setPosition(constrainedPos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('Mouse down triggered:', { scale, canDrag: scale > 0.5 });
    
    if (scale > 0.5) {
      e.preventDefault();
      e.stopPropagation();
      
      const startPos = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      
      console.log('Starting drag:', {
        mousePos: { x: e.clientX, y: e.clientY },
        currentPosition: position,
        dragStart: startPos
      });
      
      setIsDragging(true);
      setDragStart(startPos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 0.5) {
      e.preventDefault();
      e.stopPropagation();
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      console.log('Mouse move during drag:', {
        mousePos: { x: e.clientX, y: e.clientY },
        dragStart,
        newPosition: { newX, newY }
      });
      
      const constrainedPos = constrainPosition(newX, newY, scale);
      setPosition(constrainedPos);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log('Mouse up triggered, was dragging:', isDragging);
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }
  };

  // Global mouse event listeners for better drag handling
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scale > 0.5) {
        e.preventDefault();
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        console.log('Global mouse move:', {
          mousePos: { x: e.clientX, y: e.clientY },
          dragStart,
          newPosition: { newX, newY }
        });
        
        const constrainedPos = constrainPosition(newX, newY, scale);
        setPosition(constrainedPos);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log('Global mouse up, was dragging:', isDragging);
      if (isDragging) {
        e.preventDefault();
        setIsDragging(false);
      }
    };

    if (isDragging) {
      console.log('Adding global mouse listeners');
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      
      return () => {
        console.log('Removing global mouse listeners');
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, scale, position]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Wheel event:', e.deltaY);
    
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const newScale = Math.min(Math.max(scale * delta, 0.25), 3);
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

  console.log('Rendering ImageViewer:', { 
    scale, 
    position, 
    isDragging, 
    canDrag: scale > 0.5,
    imageSize,
    containerSize 
  });

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
              className="relative flex items-center justify-center select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                cursor: scale > 0.5 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                width: 'fit-content',
                height: 'fit-content'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <img
                ref={imageRef}
                src={images[currentIndex]}
                alt={`${title || 'Image'} ${currentIndex + 1}`}
                className="block max-w-none pointer-events-none"
                style={{
                  maxHeight: scale <= 0.5 ? '70vh' : 'none',
                  maxWidth: scale <= 0.5 ? '90vw' : 'none',
                  height: 'auto',
                  width: 'auto'
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
              disabled={scale <= 0.25}
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
