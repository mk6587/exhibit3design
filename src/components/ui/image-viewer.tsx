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
        const newSize = { width: rect.width, height: rect.height };
        setContainerSize(newSize);
        console.log('Container size updated:', newSize);
        
        // Recalculate image size if image is loaded
        if (imageRef.current && imageRef.current.complete) {
          calculateImageSize(newSize);
        }
      }
    };

    if (isOpen) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(updateContainerSize, 100);
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

  const calculateImageSize = (containerSizeToUse = containerSize) => {
    if (imageRef.current && containerSizeToUse.width > 0 && containerSizeToUse.height > 0) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      
      console.log('Calculating image size:', { 
        naturalWidth, 
        naturalHeight, 
        containerWidth: containerSizeToUse.width, 
        containerHeight: containerSizeToUse.height 
      });
      
      // Calculate the display size at scale 1
      const aspectRatio = naturalWidth / naturalHeight;
      let displayWidth, displayHeight;
      
      if (containerSizeToUse.width / containerSizeToUse.height > aspectRatio) {
        // Container is wider, fit to height
        displayHeight = Math.min(containerSizeToUse.height * 0.9, naturalHeight);
        displayWidth = displayHeight * aspectRatio;
      } else {
        // Container is taller, fit to width
        displayWidth = Math.min(containerSizeToUse.width * 0.9, naturalWidth);
        displayHeight = displayWidth / aspectRatio;
      }
      
      const newImageSize = { width: displayWidth, height: displayHeight };
      setImageSize(newImageSize);
      console.log('Image size calculated and set:', newImageSize);
      
      return newImageSize;
    }
    return null;
  };

  const handleImageLoad = () => {
    console.log('Image loaded, calculating size...');
    calculateImageSize();
  };

  const constrainPosition = (newX: number, newY: number, currentScale: number) => {
    // Use current imageSize or recalculate if needed
    let currentImageSize = imageSize;
    if (currentImageSize.width === 0 || currentImageSize.height === 0) {
      console.log('Image size not set, attempting to calculate...');
      const calculated = calculateImageSize();
      currentImageSize = calculated || { width: 0, height: 0 };
    }
    
    if (currentImageSize.width === 0 || currentImageSize.height === 0) {
      console.log('Cannot constrain position - image size still 0');
      return { x: 0, y: 0 };
    }
    
    const scaledImageWidth = currentImageSize.width * currentScale;
    const scaledImageHeight = currentImageSize.height * currentScale;
    
    // Calculate how much the scaled image exceeds the container
    const excessWidth = Math.max(0, scaledImageWidth - containerSize.width);
    const excessHeight = Math.max(0, scaledImageHeight - containerSize.height);
    
    // Only allow dragging if there's excess size to scroll
    const maxX = excessWidth / 2;
    const maxY = excessHeight / 2;
    
    const constrainedPos = {
      x: maxX > 0 ? Math.max(-maxX, Math.min(maxX, newX)) : 0,
      y: maxY > 0 ? Math.max(-maxY, Math.min(maxY, newY)) : 0
    };
    
    console.log('Position constrained:', {
      input: { newX, newY },
      output: constrainedPos,
      constraints: { maxX, maxY },
      scaledImageSize: { scaledImageWidth, scaledImageHeight },
      containerSize,
      currentImageSize,
      excessSize: { excessWidth, excessHeight }
    });
    
    return constrainedPos;
  };

  const canDragImage = () => {
    if (imageSize.width === 0 || imageSize.height === 0) {
      return false;
    }
    
    // Allow dragging when zoomed above the initial scale (0.5)
    // or when the scaled image is larger than the container
    if (scale > 0.5) {
      const scaledImageWidth = imageSize.width * scale;
      const scaledImageHeight = imageSize.height * scale;
      
      // Can drag if scaled image is larger than container OR if we're zoomed beyond initial scale
      return scaledImageWidth > containerSize.width || 
             scaledImageHeight > containerSize.height ||
             scale > 0.8; // Allow dragging when zoomed beyond 80%
    }
    
    return false;
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
    const dragAllowed = canDragImage();
    console.log('Mouse down triggered:', { scale, canDrag: dragAllowed, imageSize });
    
    if (dragAllowed) {
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
    } else {
      console.log('Cannot start drag - conditions not met');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && canDragImage()) {
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
      if (isDragging && canDragImage()) {
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

  const dragAllowed = canDragImage();
  console.log('Rendering ImageViewer:', { 
    scale, 
    position, 
    isDragging, 
    canDrag: dragAllowed,
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
                cursor: dragAllowed ? (isDragging ? 'grabbing' : 'grab') : 'default',
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
