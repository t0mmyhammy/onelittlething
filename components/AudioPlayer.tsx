'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  compact?: boolean;
}

export default function AudioPlayer({ audioUrl, compact = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.onerror = () => {
      console.error('Error loading audio:', audioUrl);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-sage/10 rounded-lg px-3 py-2">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div
          className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-sage transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-gray-500 min-w-[32px]">
          {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-sage/10 rounded-xl px-4 py-3">
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        <div
          className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-sage transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <span className="text-sm text-gray-600 min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
