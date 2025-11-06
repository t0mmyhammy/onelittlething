'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 for square/circle
}

export default function ImageCropper({ imageSrc, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 256 });

  const CROP_SIZE = 300; // Size of the crop area (300px for retina displays, displays at 48-96px)
  const CROP_RADIUS = CROP_SIZE / 2;

  // Update container size on mount and resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Calculate minimum scale to ensure crop circle fits within image
  const calculateMinScale = (imgWidth: number, imgHeight: number) => {
    if (!imgWidth || !imgHeight) return 1;
    // The crop circle must fit within the image
    // Minimum scale is when the crop diameter fits in the smaller dimension
    const minDimension = Math.min(imgWidth, imgHeight);
    return CROP_SIZE / minDimension;
  };

  // Constrain position to keep crop circle within image bounds
  const constrainPosition = (newPosition: { x: number; y: number }, currentScale: number) => {
    if (!imageDimensions.width || !imageDimensions.height) return newPosition;
    
    // Calculate displayed image dimensions at current scale
    const imgDisplayWidth = imageDimensions.width * currentScale;
    const imgDisplayHeight = imageDimensions.height * currentScale;
    
    const containerCenterX = containerSize.width / 2;
    const containerCenterY = containerSize.height / 2;
    
    // The image is centered at (containerCenter + position)
    // The crop circle is at containerCenter
    // We need the crop circle to stay within the image bounds
    
    // Maximum allowed position: when crop edge touches image edge
    // Image left edge: containerCenterX + position.x - imgDisplayWidth/2
    // Crop left edge: containerCenterX - CROP_RADIUS
    // We need: crop left edge >= image left edge
    // containerCenterX - CROP_RADIUS >= containerCenterX + position.x - imgDisplayWidth/2
    // -CROP_RADIUS >= position.x - imgDisplayWidth/2
    // position.x <= imgDisplayWidth/2 - CROP_RADIUS
    
    const maxX = (imgDisplayWidth / 2) - CROP_RADIUS;
    const maxY = (imgDisplayHeight / 2) - CROP_RADIUS;
    
    return {
      x: Math.max(-maxX, Math.min(maxX, newPosition.x)),
      y: Math.max(-maxY, Math.min(maxY, newPosition.y)),
    };
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      
      // Calculate minimum scale needed
      const calculatedMinScale = calculateMinScale(img.naturalWidth, img.naturalHeight);
      
      // Start at a scale that shows the image nicely (slightly above minimum)
      const initialScale = calculatedMinScale * 1.2;
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setPosition(constrainPosition(newPosition, scale));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const newPosition = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      };
      setPosition(constrainPosition(newPosition, scale));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05; // Slower zoom for better control
    const minScale = calculateMinScale(imageDimensions.width, imageDimensions.height);
    
    setScale((prev) => {
      const newScale = prev * delta;
      // Ensure scale doesn't go below minimum
      const constrainedScale = Math.max(minScale, Math.min(3, newScale));
      
      // When scale changes, constrain position to keep crop circle within bounds
      if (constrainedScale !== prev) {
        setPosition((currentPos) => constrainPosition(currentPos, constrainedScale));
      }
      
      return constrainedScale;
    });
  };

  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // The crop circle is centered at the container center
    const cropCenterX = containerSize.width / 2;
    const cropCenterY = containerSize.height / 2;
    
    // The image is displayed with its center at (containerCenter + position)
    // The displayed image dimensions are: naturalWidth * scale, naturalHeight * scale
    const displayedWidth = img.naturalWidth * scale;
    const displayedHeight = img.naturalHeight * scale;
    
    // The image's top-left corner in container coordinates
    const imgTopLeftX = cropCenterX + position.x - (displayedWidth / 2);
    const imgTopLeftY = cropCenterY + position.y - (displayedHeight / 2);
    
    // The crop circle's top-left corner in container coordinates
    const cropTopLeftX = cropCenterX - CROP_RADIUS;
    const cropTopLeftY = cropCenterY - CROP_RADIUS;
    
    // Calculate the offset from image top-left to crop top-left in container pixels
    const offsetX = cropTopLeftX - imgTopLeftX;
    const offsetY = cropTopLeftY - imgTopLeftY;
    
    // Convert to source image coordinates
    // 1 container pixel = 1 / scale source pixels
    const sourceOffsetX = offsetX / scale;
    const sourceOffsetY = offsetY / scale;
    
    // The crop size in source image coordinates
    const sourceCropSize = CROP_SIZE / scale;
    
    // Calculate source crop coordinates (top-left corner of crop area)
    const sourceX = sourceOffsetX;
    const sourceY = sourceOffsetY;

    // Ensure we don't go outside image bounds
    const clampedSourceX = Math.max(0, Math.min(img.naturalWidth - sourceCropSize, sourceX));
    const clampedSourceY = Math.max(0, Math.min(img.naturalHeight - sourceCropSize, sourceY));
    const clampedSourceWidth = Math.min(sourceCropSize, img.naturalWidth - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceCropSize, img.naturalHeight - clampedSourceY);

    // Draw the cropped image
    ctx.drawImage(
      img,
      clampedSourceX,
      clampedSourceY,
      clampedSourceWidth,
      clampedSourceHeight,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );

    // Convert to blob with optimized quality
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.82);
  };

  if (!imageLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 text-center">
        Drag to reposition • Scroll to zoom
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* Crop overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            clipPath: `circle(${CROP_RADIUS}px at center)`,
          }}
        />
        
        {/* Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop"
          className="absolute select-none pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
            transformOrigin: 'center center',
            width: imageDimensions.width,
            height: imageDimensions.height,
            maxWidth: 'none',
            maxHeight: 'none',
          }}
          draggable={false}
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="flex-1 px-4 py-2 bg-rose text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Use Photo
        </button>
      </div>
    </div>
  );
}
