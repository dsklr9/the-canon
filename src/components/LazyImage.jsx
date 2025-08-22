import React, { useState, useEffect, useRef, memo } from 'react';

const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad = null,
  onError = null,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !imageSrc) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, imageSrc, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(true);
    if (onError) onError();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder or skeleton while loading */}
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder}
        </div>
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
          <span className="text-2xl">🎤</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;