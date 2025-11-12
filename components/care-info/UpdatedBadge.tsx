'use client';

interface UpdatedBadgeProps {
  timestamp?: string | null;
}

export default function UpdatedBadge({ timestamp }: UpdatedBadgeProps) {
  if (!timestamp) return null;

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    if (diffDays < 14) return 'Updated 1 week ago';
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;

    // For dates > 30 days, show full date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return `Updated on ${date.toLocaleDateString('en-US', options)}`;
  };

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#F7F7F5] text-[#6B6B6B] text-xs font-medium">
      {getRelativeTime(timestamp)}
    </span>
  );
}
