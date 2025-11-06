'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageCropper from './ImageCropper';
import PhotoUpdateModal from './PhotoUpdateModal';
import { PencilIcon } from '@heroicons/react/24/outline';

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildUpdated: () => void;
  child: {
    id: string;
    name: string;
    birthdate: string | null;
    gender: string | null;
    photo_url: string | null;
    family_id?: string; // Optional, but needed for RLS
  } | null;
}

export default function EditChildModal({ isOpen, onClose, onChildUpdated, child }: EditChildModalProps) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPhotoUpdateModal, setShowPhotoUpdateModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  // Check if birthdate is in the future (parse as local date to avoid timezone issues)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const isUnborn = birthdate && parseLocalDate(birthdate) > new Date();

  // Populate form when child data changes
  useEffect(() => {
    if (child) {
      setName(child.name);
      setBirthdate(child.birthdate || '');
      setGender(child.gender || '');
      setPhotoPreview(child.photo_url || null);
      // Try to find original photo URL (stored as {child.id}-original.*)
      // For now, we'll check if original exists, otherwise use cropped for re-crop
      setOriginalPhotoUrl(null); // Will be set when we check storage
      setPhotoFile(null);
    }
  }, [child]);

  const handlePhotoSelected = async (file: File) => {
    // Store the original file for later use
    setPhotoFile(file);
    
    // Create preview for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoSelected(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to File
    const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Store the original file if we have it (from new upload)
    // Otherwise, we're re-cropping and should keep the original
    const originalFile = photoFile && !photoFile.name.startsWith('cropped-') ? photoFile : null;
    
    // Set the cropped file for upload
    setPhotoFile(croppedFile);
    
    // Store original file reference if we have it
    if (originalFile) {
      // We'll upload both original and cropped in handleSubmit
      // For now, store it in a way we can access it
      (croppedFile as any).originalFile = originalFile;
    }
    
    // Create preview from cropped blob
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);
    setShowCropper(false);
    setImageToCrop(null);
    // Close photo update modal if it's open
    setShowPhotoUpdateModal(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    // Don't clear photoFile if we're re-cropping an existing photo
    if (!child?.photo_url || photoPreview !== child.photo_url) {
      setPhotoFile(null);
    }
  };

  const handleReCrop = () => {
    // Use photoPreview if available, otherwise use child.photo_url
    const photoUrl = photoPreview || child?.photo_url;
    
    if (!photoUrl) {
      setError('No photo to re-crop');
      return;
    }
    
    // Try to find the original photo first
    // Extract the filename from the URL
    const urlParts = photoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Try to construct original filename: {uuid}-{timestamp}.{ext} -> {uuid}-original-{timestamp}.{ext}
    const originalFilename = filename.replace(/^(.+)-(\d+)(\.[^.]+)$/, '$1-original-$2$3');
    
    // Get the original photo URL
    const { data: originalData } = supabase.storage
      .from('child-photos')
      .getPublicUrl(originalFilename);
    
    // Try original first, but don't wait - just set it and open cropper
    // The cropper will handle loading the image
    setImageToCrop(originalData.publicUrl);
    setShowCropper(true);
    
    // Also try to verify original exists in background, but don't block
    fetch(originalData.publicUrl, { method: 'HEAD' })
      .then((response) => {
        if (!response.ok) {
          // Original doesn't exist, switch to cropped version
          setImageToCrop(photoUrl);
        }
      })
      .catch(() => {
        // On error, use cropped version
        setImageToCrop(photoUrl);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadingPhoto(false);

    if (!child) {
      setError('Child data is missing.');
      setLoading(false);
      return;
    }

    try {
      let photoUrl = child.photo_url || null;

      // Upload photo if a new one was selected
      if (photoFile) {
        setUploadingPhoto(true);
        const timestamp = Date.now();
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        
        // Check if we have an original file stored (from new upload)
        const originalFile = (photoFile as any).originalFile;
        const isNewUpload = !!originalFile;
        
        // Upload the cropped version (this is what we display)
        const croppedFileName = `${child.id}-${timestamp}.${fileExt}`;
        const croppedFilePath = croppedFileName;

        const { error: uploadError } = await supabase.storage
          .from('child-photos')
          .upload(croppedFilePath, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
            throw new Error(
              'Storage bucket "child-photos" not found. Please create it in your Supabase dashboard:\n\n' +
              '1. Go to Storage in your Supabase dashboard\n' +
              '2. Click "New bucket"\n' +
              '3. Name it "child-photos"\n' +
              '4. Make it public\n' +
              '5. Click "Create bucket"'
            );
          }
          throw uploadError;
        }

        // If this is a new upload, also store the original for future re-cropping
        if (isNewUpload && originalFile) {
          const originalExt = originalFile.name.split('.').pop() || 'jpg';
          const originalFileName = `${child.id}-original-${timestamp}.${originalExt}`;
          const originalFilePath = originalFileName;

          const { error: originalUploadError } = await supabase.storage
            .from('child-photos')
            .upload(originalFilePath, originalFile, {
              cacheControl: '3600',
              upsert: false,
            });

          // Don't fail if original upload fails, but log it
          if (originalUploadError) {
            console.warn('Could not upload original photo:', originalUploadError);
          }
        }

        // Get public URL for cropped version (this is what we display)
        const { data: urlData } = supabase.storage
          .from('child-photos')
          .getPublicUrl(croppedFilePath);

        photoUrl = urlData.publicUrl;

        // Delete old photos if they exist
        if (child.photo_url) {
          try {
            const oldPath = child.photo_url.split('/child-photos/').pop();
            if (oldPath) {
              // Delete both cropped and original if they exist
              const oldOriginalPath = oldPath.replace(/(\d+)-(\d+)\./, `$1-original-$2.`);
              await supabase.storage
                .from('child-photos')
                .remove([oldPath, oldOriginalPath].filter(Boolean));
            }
          } catch (deleteError) {
            // Ignore delete errors - old photos might not exist
            console.warn('Could not delete old photos:', deleteError);
          }
        }
      }

      // Use RPC function to update child (bypasses RLS issues)
      const { error: updateError } = await supabase.rpc('update_child', {
        child_id: child.id,
        child_name: name.trim(),
        child_birthdate: birthdate || null,
        child_gender: gender || null,
        child_photo_url: photoUrl,
      });

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(
          `Failed to update child: ${updateError.message}\n\n` +
          `Make sure you've run the latest SQL migrations in your Supabase SQL Editor.`
        );
      }

      // Reset form
      setName('');
      setBirthdate('');
      setGender('');
      setPhotoFile(null);
      setPhotoPreview(null);
      onChildUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update child');
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-gray-900">Edit Child</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="editChildName" className="block text-sm font-medium text-gray-700 mb-2">
              Child's Name
            </label>
            <input
              id="editChildName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
              placeholder="Alex"
            />
          </div>

          <div>
            <label htmlFor="editBirthdate" className="block text-sm font-medium text-gray-700 mb-2">
              {isUnborn ? 'Due Date' : 'Birthdate'} <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              id="editBirthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (gender === 'boy') {
                    setGender('');
                  } else {
                    setGender('boy');
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  gender === 'boy'
                    ? 'border-rose bg-rose/10 text-rose'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                } cursor-pointer`}
              >
                <span className="text-3xl font-bold">♂</span>
                <span className="text-sm font-medium">Boy</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (gender === 'girl') {
                    setGender('');
                  } else {
                    setGender('girl');
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 rounded-lg transition-all ${
                  gender === 'girl'
                    ? 'border-rose bg-rose/10 text-rose'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                } cursor-pointer`}
              >
                <span className="text-3xl font-bold">♀</span>
                <span className="text-sm font-medium">Girl</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            {showCropper && imageToCrop ? (
              <ImageCropper
                imageSrc={imageToCrop}
                onCrop={handleCropComplete}
                onCancel={handleCropCancel}
              />
            ) : (
              <div className="space-y-3">
                {/* Current photo display */}
                {photoPreview && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover object-center border-4 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhotoUpdateModal(true)}
                        className="absolute bottom-0 right-0 bg-rose text-white p-2 rounded-full shadow-lg hover:bg-rose/90 transition-colors"
                        aria-label="Update photo"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleReCrop}
                        className="text-sm text-gray-700 hover:text-rose transition-colors"
                      >
                        Re-crop
                      </button>
                      <span className="text-sm text-gray-300">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(child?.photo_url || null);
                        }}
                        className="text-sm text-rose hover:underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                )}
                
                {/* No photo - show update button */}
                {!photoPreview && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoUpdateModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Update photo
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPhoto || !name.trim()}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                name.trim() && !loading && !uploadingPhoto
                  ? 'bg-rose hover:scale-[1.02]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {uploadingPhoto ? 'Uploading photo...' : loading ? 'Updating...' : 'Update Child'}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Update Modal */}
      <PhotoUpdateModal
        isOpen={showPhotoUpdateModal}
        onClose={() => setShowPhotoUpdateModal(false)}
        onPhotoSelected={handlePhotoSelected}
        childName={name || child?.name || 'Your child'}
      />
    </div>
  );
}

