'use client';

import { useState, useEffect } from 'react';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface PhotoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (file: File) => void;
  childName: string;
}

export default function PhotoUpdateModal({ isOpen, onClose, onPhotoSelected, childName }: PhotoUpdateModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
      onClose();
    }
    // Reset input
    e.target.value = '';
  };

  const handleCameraClick = () => {
    document.getElementById('camera-input')?.click();
  };

  const handleUploadClick = () => {
    document.getElementById('file-input')?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-serif text-gray-900">Update photo</h2>
            <p className="text-gray-600 mt-2">
              {childName}, help others recognize {childName.split(' ')[0]}!
            </p>
          </div>

          {/* Example photo circle */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
              <PhotoIcon className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600 text-center">
            Take or upload a photo, then crop and adjust it to perfection.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Mobile: Camera first, then Upload */}
            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <CameraIcon className="w-5 h-5" />
                  Use camera
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Upload photo
                </button>
              </>
            ) : (
              /* Desktop: Upload first, then Camera */
              <>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Upload photo
                </button>
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
                >
                  <CameraIcon className="w-5 h-5" />
                  Use camera
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          id="camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

