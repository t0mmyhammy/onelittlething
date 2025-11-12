'use client';

import { Eye, EyeOff } from 'lucide-react';

interface CompactFieldProps {
  label: string;
  value: string;
  icon?: React.ElementType;
  isRedacted?: boolean;
  isSecure?: boolean;
  onRedactionToggle?: () => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export default function CompactField({
  label,
  value,
  icon: Icon,
  isRedacted = false,
  isSecure = false,
  onRedactionToggle,
  onChange,
  placeholder,
  multiline = false,
  rows = 1
}: CompactFieldProps) {
  return (
    <div className="space-y-1.5">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {label}
        </label>

        {isSecure && onRedactionToggle && (
          <button
            onClick={onRedactionToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
            title={isRedacted ? "Show in shared guides" : "Hide from shared guides"}
          >
            {isRedacted ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Input */}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm resize-none bg-white"
        />
      ) : (
        <input
          type={isSecure && !isRedacted ? "password" : "text"}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-sand rounded-lg focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage text-sm bg-white"
        />
      )}
    </div>
  );
}
