'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ImageCropper from '@/components/ImageCropper';
import PhotoUpdateModal from '@/components/PhotoUpdateModal';
import FamilyManagement from '@/components/FamilyManagement';
import { UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);
      setEmail(authUser.email || '');

      // Load user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('display_name, profile_photo_url')
        .eq('user_id', authUser.id)
        .single();

      if (prefs) {
        setDisplayName(prefs.display_name || '');
        setPhotoUrl(prefs.profile_photo_url || null);
        setPhotoPreview(prefs.profile_photo_url || null);
      }

      // Load family data
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', authUser.id)
        .single();

      if (familyMember) {
        setFamilyId(familyMember.family_id);

        // Load all family members with user details
        const { data: members } = await supabase
          .from('family_members')
          .select(`
            id,
            user_id,
            role,
            user:user_id (
              email,
              user_metadata
            )
          `)
          .eq('family_id', familyMember.family_id);

        if (members) {
          setFamilyMembers(members);
        }
      }
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelected = async (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
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

      // Update user preferences (upsert to create if doesn't exist)
      const { data: updateData, error: updateError } = await supabase
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
        throw new Error(`Failed to update profile: ${updateError.message}\n\nDetails: ${JSON.stringify(updateError)}`);
      }

      setPhotoUrl(newPhotoUrl);
      setPhotoFile(null);
      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-sand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600 mb-8">
            Manage your account information and preferences
          </p>

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

          <div className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Photo
              </label>
              {showCropper && imageToCrop ? (
                <ImageCropper
                  imageSrc={imageToCrop}
                  onCrop={handleCropComplete}
                  onCancel={handleCropCancel}
                />
              ) : (
                <div className="flex items-center gap-6">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    {photoPreview ? 'Change Photo' : 'Add Photo'}
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                        setPhotoUrl(null);
                      }}
                      className="text-sm text-rose hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                This is how your name will appear throughout the app
              </p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                Contact support to change your email address
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving || uploadingPhoto}
                className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all ${
                  saving || uploadingPhoto
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-rose hover:scale-[1.02]'
                }`}
              >
                {uploadingPhoto ? 'Uploading photo...' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Family Management */}
        {familyId && user && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mt-6">
            <FamilyManagement
              familyId={familyId}
              members={familyMembers}
              currentUserId={user.id}
            />
          </div>
        )}
      </main>

      {/* Photo Update Modal */}
      <PhotoUpdateModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoSelected={handlePhotoSelected}
        childName="your profile"
      />
    </div>
  );
}
