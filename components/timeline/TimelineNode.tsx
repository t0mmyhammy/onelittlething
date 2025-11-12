'use client';

import { User } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  photo_url: string | null;
  label_color?: string | null;
}

interface TimelineNodeProps {
  children: Child[];
  creatorInitial?: string;
}

// Helper to get pastel background color based on name
const getNodeColor = (name: string): string => {
  const colors = [
    'bg-rose/20 text-rose',
    'bg-sage/20 text-sage',
    'bg-amber/20 text-amber',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
  ];

  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function TimelineNode({ children, creatorInitial }: TimelineNodeProps) {
  // If entry has a single child, show their avatar/initial
  if (children.length === 1) {
    const child = children[0];

    if (child.photo_url) {
      return (
        <div className="relative flex-shrink-0">
          <img
            src={child.photo_url}
            alt={child.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md"
          />
        </div>
      );
    }

    const colorClasses = getNodeColor(child.name);
    return (
      <div className={`relative flex-shrink-0 w-11 h-11 rounded-full ${colorClasses} flex items-center justify-center font-semibold text-lg ring-2 ring-white shadow-md`}>
        {child.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  // If multiple children, show creator initial or user icon
  if (creatorInitial) {
    return (
      <div className="relative flex-shrink-0 w-11 h-11 rounded-full bg-sage/20 text-sage flex items-center justify-center font-semibold text-lg ring-2 ring-white shadow-md">
        {creatorInitial}
      </div>
    );
  }

  // Fallback: generic user icon
  return (
    <div className="relative flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center ring-2 ring-white shadow-md">
      <User className="w-5 h-5" />
    </div>
  );
}
