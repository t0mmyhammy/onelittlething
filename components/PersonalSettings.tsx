'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageCropper from './ImageCropper';
import PhotoUpdateModal from './PhotoUpdateModal';
import DeleteAccountSection from './DeleteAccountSection';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface UserPrefs {
  display_name: string | null;
  profile_photo_url: string | null;
}

interface PersonalSettingsProps {
  user: any;
  initialUserPrefs: UserPrefs | null;
}

export default function PersonalSettings({ user, initialUserPrefs }: PersonalSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initialUserPrefs?.display_name || '');
  const [email] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialUserPrefs?.profile_photo_url || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialUserPrefs?.profile_photo_url || null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const handlePhotoSelected = async (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRecropExisting = async () => {
    if (!photoPreview) return;

    try {
      // Fetch the existing photo as a blob
      const response = await fetch(photoPreview);
      const blob = await response.blob();

      // Convert to File object for consistency
      const file = new File([blob], 'existing-photo.jpg', { type: 'image/jpeg' });
      setPhotoFile(file);

      // Convert to data URL for cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error loading existing photo:', error);
      setError('Failed to load existing photo for cropping');
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setPhotoFile(croppedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);
    setShowCropper(false);
    setImageToCrop(null);
    setShowPhotoModal(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setPhotoFile(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSuccess('');
    setSaving(true);
    setUploadingPhoto(false);

    try {
      let newPhotoUrl = photoUrl;

      // Upload new photo if one was selected
      if (photoFile) {
        setUploadingPhoto(true);
        const timestamp = Date.now();
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        newPhotoUrl = urlData.publicUrl;

        // Delete old photo if it exists
        if (photoUrl) {
          try {
            const oldPath = photoUrl.split('/profile-photos/').pop();
            if (oldPath) {
              await supabase.storage.from('profile-photos').remove([oldPath]);
            }
          } catch (deleteError) {
            console.warn('Could not delete old photo:', deleteError);
          }
        }
      }

      // Update user preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          display_name: displayName.trim() || null,
          profile_photo_url: newPhotoUrl,
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      setPhotoUrl(newPhotoUrl);
      setPhotoFile(null);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName(initialUserPrefs?.display_name || '');
    setPhotoPreview(initialUserPrefs?.profile_photo_url || null);
    setPhotoFile(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-gray-900">Personal Information</h2>
        {!isEditing && !showCropper && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-rose/10 flex items-center justify-center text-gray-600 hover:text-rose transition-all"
            aria-label="Edit profile"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm mb-6">
          {success}
        </div>
      )}

      {showCropper && imageToCrop ? (
        <ImageCropper
          imageSrc={imageToCrop}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      ) : (
        <div className="space-y-6">
          {/* Profile Photo - Centered */}
          <div className="flex flex-col items-center py-6 border-b border-gray-200">
            <div
              className="relative mb-4 group cursor-pointer"
              onClick={isEditing ? () => setShowPhotoModal(true) : undefined}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                  <UserCircleIcon className="w-20 h-20 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all">
                  <PencilIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            {isEditing && photoPreview && (
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setPhotoUrl(null);
                }}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            {isEditing ? (
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {displayName || 'Not set'}
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
              {email}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Used for notifications and family access
            </p>
            <p className="text-xs text-gray-400 mt-1 opacity-70">
              Contact support to change your email address
            </p>
          </div>

          {/* Action Buttons - Only show when editing */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingPhoto}
                className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all ${
                  saving || uploadingPhoto
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-rose hover:scale-[1.02]'
                }`}
              >
                {uploadingPhoto ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Photo Update Modal */}
      <PhotoUpdateModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoSelected={handlePhotoSelected}
        onRecropExisting={handleRecropExisting}
        existingPhotoUrl={photoPreview}
        childName="your profile"
      />

      {/* Delete Account Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <DeleteAccountSection
          userId={user.id}
          userName={displayName || user.email?.split('@')[0] || 'User'}
        />
      </div>
    </div>
  );
}
