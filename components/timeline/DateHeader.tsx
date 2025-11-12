'use client';

interface DateHeaderProps {
  date: Date;
}

export default function DateHeader({ date }: DateHeaderProps) {
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();

  return (
    <div className="flex items-start gap-6 mb-6">
      {/* Date Label on Left */}
      <div className="flex-shrink-0 w-20 text-right pt-1">
        <div className="text-sm font-medium text-gray-400 tracking-wide">
          {month} {day}
        </div>
      </div>

      {/* Spacer for timeline line */}
      <div className="flex-shrink-0 w-11" />

      {/* Right side spacer (where content goes) */}
      <div className="flex-1" />
    </div>
  );
}
