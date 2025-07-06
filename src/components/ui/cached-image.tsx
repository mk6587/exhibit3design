
import React from 'react';
import { useImageCache } from '@/hooks/useImageCache';
import { Skeleton } from '@/components/ui/skeleton';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallbackSrc = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
  showSkeleton = true,
  skeletonClassName,
  className,
  alt,
  ...props
}) => {
  const { src: cachedSrc, loading, error } = useImageCache(src, {
    fallbackUrl: fallbackSrc
  });

  if (loading && showSkeleton) {
    return <Skeleton className={skeletonClassName || className} />;
  }

  return (
    <img
      src={cachedSrc}
      alt={alt}
      className={className}
      {...props}
      onError={(e) => {
        if (cachedSrc !== fallbackSrc) {
          (e.target as HTMLImageElement).src = fallbackSrc;
        }
        props.onError?.(e);
      }}
    />
  );
};

export default CachedImage;
