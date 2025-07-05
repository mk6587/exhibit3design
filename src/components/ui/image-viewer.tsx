
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      resetView();
    }
  }, [isOpen, currentIndex]);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.8);
    setScale(newScale);
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
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
    if (isDragging && scale > 1) {
      e.preventDefault();
      e.stopPropagation();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const newScale = Math.min(Math.max(scale * delta, 0.8), 3);
    setScale(newScale);
    
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
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
        
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {images.length > 1 && (
              <p className="text-sm text-gray-600">
                {currentIndex + 1} of {images.length}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Fixed Image Container - This area will never move */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <div 
            ref={imageContainerRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Zoom/Pan Wrapper - Only this moves */}
            <div
              className="relative select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <img
                src={images[currentIndex]}
                alt={`${title || 'Image'} ${currentIndex + 1}`}
                className="block"
                style={{
                  maxHeight: scale <= 1 ? '70vh' : 'none',
                  maxWidth: scale <= 1 ? '90vw' : 'none',
                  height: 'auto',
                  width: 'auto'
                }}
                draggable={false}
              />
            </div>
            
            {/* Fixed Navigation arrows - Never move */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-colors z-10"
                  style={{ position: 'absolute' }}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-colors z-10"
                  style={{ position: 'absolute' }}
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Fixed Controls Footer - Never moves */}
        <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.8}
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

        {/* Fixed Thumbnails - Never move */}
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
