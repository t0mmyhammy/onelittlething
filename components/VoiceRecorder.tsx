'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onClear: () => void;
  audioBlob: Blob | null;
  maxDuration?: number; // in seconds, default 30
}

export default function VoiceRecorder({
  onRecordingComplete,
  onClear,
  audioBlob,
  maxDuration = 30,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Create audio element when blob changes
  useEffect(() => {
    if (audioBlob) {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrlRef.current);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
      };

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(progress);
        }
      };
    }
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    setRecordingTime(0);
    onClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If we have a recording, show playback controls
  if (audioBlob) {
    return (
      <div className="flex items-center gap-3 bg-sage/10 rounded-xl px-4 py-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all duration-100"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Remove recording"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-700 font-medium">Recording...</span>
        <span className="text-red-600 font-mono">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={stopRecording}
          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Stop recording"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default state - show record button
  return (
    <button
      type="button"
      onClick={startRecording}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
    >
      <Mic className="w-4 h-4" />
      <span>Record voice note (max {maxDuration}s)</span>
    </button>
  );
}
