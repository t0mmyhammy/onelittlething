'use client';

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { PencilSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { BABY_SIZES } from "@/lib/babySizes";
import { calcFromDueDate } from "@/lib/pregnancy";

type Props = {
  dueDateISO: string;
  babyName: string;
};

export default function BabyCountdownCard({ dueDateISO, babyName }: Props) {
  const meta = useMemo(() => calcFromDueDate(dueDateISO), [dueDateISO]);
  const weekData = BABY_SIZES.find(w => w.week === meta.week);
  const [idx, setIdx] = useState<number>(0);
  const [showMode, setShowMode] = useState<'term' | 'due'>('term'); // Toggle between % to term and % to due

  // Remember last picked comparison per week
  useEffect(() => {
    const key = `baby-size-idx-${meta.week}`;
    const saved = localStorage.getItem(key);
    setIdx(saved ? Number(saved) : 0);
  }, [meta.week]);

  const items = weekData?.items ?? [];
  const item = items.length > 0 ? items[(idx % items.length + items.length) % items.length] : null;

  // Calculate weeks until term (37 weeks)
  const weeksUntilTerm = Math.max(0, 37 - meta.week);

  // Calculate percentage to due date (40 weeks)
  const pctToDue = Math.min(100, Math.max(0, +((meta.week - 1) / 40 * 100).toFixed(1)));

  // Calculate days until term (37 weeks from pregnancy start)
  const termDate = new Date(dueDateISO);
  termDate.setDate(termDate.getDate() - (40 - 37) * 7); // 3 weeks before due date
  const daysUntilTerm = Math.max(0, Math.ceil((termDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  // Helper to format weeks and days
  const formatWeeksAndDays = (totalDays: number) => {
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    if (weeks === 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (days === 0) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}, ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  function cycle() {
    if (items.length < 2) return;
    const next = (idx + 1) % items.length;
    setIdx(next);
    localStorage.setItem(`baby-size-idx-${meta.week}`, String(next));
  }

  function togglePercentageMode() {
    setShowMode(prev => prev === 'term' ? 'due' : 'term');
  }

  const displayPercent = showMode === 'term' ? meta.pctComplete : pctToDue;

  const headline =
    meta.status === "post" ? "Any day now" :
    meta.status === "pre" ? "Getting started" :
    meta.status === "term" ? "Full term" :
    `Week ${meta.week}`;

  const sub =
    meta.status === "post"
      ? "Past your due date. Thinking of you."
      : meta.status === "pre"
      ? "You are at the very beginning. Exciting times ahead!"
      : meta.status === "term"
      ? `${babyName} is ready! ${item ? `The size of ${item.name}` : ""}`
      : `${babyName} is the size of ${item?.name || "something adorable"}`;

  return (
    <div
      role="region"
      aria-label="Baby countdown"
      className="rounded-xl p-4 shadow-sm border border-sand bg-white flex items-center gap-4"
    >
      <ProgressRing
        percent={displayPercent}
        icon={item?.icon}
        iconAlt={item?.name}
        mode={showMode}
        onToggle={togglePercentageMode}
        showCycleButton={items.length > 1 && meta.status !== "pre"}
        onCycle={cycle}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div className="text-xs text-gray-500">Pregnancy progress</div>
            <div className="text-lg font-serif text-gray-900">{headline}</div>
          </div>
          <Link
            href="/settings#family"
            className="text-gray-400 hover:text-sage transition-colors p-1"
            aria-label="Edit child details"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </Link>
        </div>

        <div className="text-sm text-gray-700 mb-2">{sub}</div>

        {meta.status === "normal" && (
          <div className="text-xs text-gray-600 mb-2 space-y-0.5">
            <div>{formatWeeksAndDays(meta.daysUntilDue)} until due date</div>
            {daysUntilTerm > 0 && (
              <div>{formatWeeksAndDays(daysUntilTerm)} until term</div>
            )}
          </div>
        )}

        {meta.status === "term" && (
          <div className="text-xs text-gray-600 mb-2">
            <div>{meta.daysUntilDue} {meta.daysUntilDue === 1 ? 'day' : 'days'} until due date</div>
          </div>
        )}

        {meta.status === "post" && meta.daysUntilDue < 0 && (
          <div className="text-xs text-gray-600 mb-2">
            {Math.abs(meta.daysUntilDue)} {Math.abs(meta.daysUntilDue) === 1 ? 'day' : 'days'} past due date
          </div>
        )}

      </div>
    </div>
  );
}

function Icon({ icon, alt }: { icon: string; alt: string }) {
  // For now, we're using emojis as the icon
  // This can be replaced with <img src={icon} /> when SVG icons are available
  return (
    <div className="text-lg" role="img" aria-label={alt}>
      {icon}
    </div>
  );
}

function ProgressRing({
  percent,
  icon,
  iconAlt,
  mode,
  onToggle,
  showCycleButton,
  onCycle
}: {
  percent: number;
  icon?: string;
  iconAlt?: string;
  mode: 'term' | 'due';
  onToggle: () => void;
  showCycleButton?: boolean;
  onCycle?: () => void;
}) {
  const size = 60;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = `${(percent / 100) * c} ${c}`;

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1">
      <div className="relative">
        <button
          onClick={onToggle}
          className="focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 rounded-full"
          aria-label="Toggle percentage view"
        >
          <svg
            width={size}
            height={size}
            role="img"
            aria-label={`Pregnancy ${percent}% complete`}
            className="transform -rotate-90 cursor-pointer"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="#e5e7eb"
              strokeWidth={stroke}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="#92b4a7"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={dash}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Icon in center */}
            {icon && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                className="transform rotate-90"
                style={{ transformOrigin: 'center' }}
                role="img"
                aria-label={iconAlt}
              >
                {icon}
              </text>
            )}
          </svg>
        </button>
        {/* Cycle button overlapping top-right */}
        {showCycleButton && onCycle && (
          <button
            onClick={onCycle}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sage hover:text-rose hover:border-sage transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-1"
            aria-label="Show another size comparison"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {/* Percentage below circle with single mode indicator */}
      <div className="text-xs text-center">
        <div className="font-semibold text-gray-700">
          {Math.round(percent)}%
        </div>
        <div className="text-[10px] font-medium text-gray-600">
          {mode === 'term' ? 'to term' : 'to due'}
        </div>
      </div>
    </div>
  );
}
