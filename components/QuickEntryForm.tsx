'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Mic, Camera, X } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
}

interface QuickEntryFormProps {
  children: Child[];
  familyId: string;
  userId: string;
}

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function QuickEntryForm({
  children,
  familyId,
  userId,
}: QuickEntryFormProps) {
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(getLocalDateString(new Date()));
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Fixed placeholder to avoid hydration mismatch
  const placeholder = "What stood out today?";

  const toggleChild = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleVoiceCapture = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      alert('Voice recognition failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const removeAudio = () => {
    setAudioBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedChildren.length === 0) {
        throw new Error('Please select which kid(s) this moment is about');
      }

      const childrenToTag = selectedChildren;

      // Upload photo if selected
      let photoUrl = null;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('entry-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('entry-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      // Upload audio if recorded
      let audioUrl = null;
      if (audioBlob) {
        const fileExt = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'wav';
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('entry-audio')
          .upload(fileName, audioBlob);

        if (uploadError) {
          console.error('Audio upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('entry-audio')
            .getPublicUrl(fileName);
          audioUrl = publicUrl;
        }
      }

      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          family_id: familyId,
          created_by: userId,
          content: content.trim(),
          entry_date: entryDate,
          photo_url: photoUrl,
          audio_url: audioUrl,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      const entryChildrenData = childrenToTag.map((childId) => ({
        entry_id: entry.id,
        child_id: childId,
      }));

      const { error: relationError } = await supabase
        .from('entry_children')
        .insert(entryChildrenData);

      if (relationError) throw relationError;

      // Reset form
      setContent('');
      setEntryDate(getLocalDateString(new Date()));
      setSelectedChildren([]);
      setIsExpanded(false);
      setShowDatePicker(false);
      removePhoto();
      removeAudio();

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-sage/20">
      {/* Collapsed State - Small text input that expands on focus */}
      {!isExpanded ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="w-5 h-5 text-rose" />
            <span className="text-sm font-medium text-gray-700">{placeholder}</span>
          </div>
          <input
            type="text"
            onClick={handleExpand}
            onFocus={handleExpand}
            placeholder="Tap to capture a moment..."
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-pointer hover:border-sage hover:bg-white transition-all"
          />
        </div>
      ) : (
        /* Expanded State - Full form with reordered fields */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Collapse button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif text-gray-900">Capture a moment</h3>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setContent('');
                setShowDatePicker(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* STEP 1: Child Selection - WHO */}
          <div>
            {children.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Who is this about?</label>
                <div className="flex gap-3 flex-wrap">
                  {children.map((child) => {
                    const isSelected = selectedChildren.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => toggleChild(child.id)}
                        className={`px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-sage bg-sage/10 ring-2 ring-sage/20'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {child.photo_url ? (
                            <img
                              src={child.photo_url}
                              alt={child.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-lg font-semibold text-gray-400">
                                {child.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className={isSelected ? 'text-sage font-semibold' : 'text-gray-700'}>
                            {child.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedChildren.length === 0 && (
                  <p className="text-xs text-gray-500">Select at least one child</p>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500">No children added</span>
            )}
          </div>

          {/* STEP 2: Date Selection - WHEN */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">When did this happen?</label>
            {!showDatePicker ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEntryDate(getLocalDateString(new Date()));
                  }}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    entryDate === getLocalDateString(new Date())
                      ? 'border-sage bg-sage/10 text-sage'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setEntryDate(getLocalDateString(yesterday));
                  }}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    (() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return entryDate === getLocalDateString(yesterday);
                    })()
                      ? 'border-sage bg-sage/10 text-sage'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
                >
                  Pick Date
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={getLocalDateString(new Date())}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Use quick buttons instead
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: Content with Voice/Photo Actions - WHAT */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">What happened?</label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                placeholder={placeholder}
                className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all resize-none"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleVoiceCapture}
                  disabled={isRecording}
                  className={`p-2 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Voice capture"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Add photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {photoPreview && (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-sage"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* STEP 3b: Voice Recording */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Add a voice note</label>
            <VoiceRecorder
              onRecordingComplete={handleAudioRecordingComplete}
              onClear={removeAudio}
              audioBlob={audioBlob}
              maxDuration={30}
            />
          </div>

          {/* STEP 4: Submit Button */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-all ${
              content.trim() && !loading
                ? 'bg-sage hover:scale-[1.02]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving...' : 'Save Moment'}
          </button>
        </form>
      )}
    </div>
  );
}
