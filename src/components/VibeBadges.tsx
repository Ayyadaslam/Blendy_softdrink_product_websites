import React from 'react';
import { Ban, Droplets, Leaf } from 'lucide-react';

interface VibeBadgesProps {
  compact?: boolean;
  className?: string;
}

export const VibeBadges: React.FC<VibeBadgesProps> = ({ compact = false, className = '' }) => {
  const items = [
    { icon: Ban, label: 'Sugar-Free' },
    { icon: Leaf, label: 'Vegan' },
    { icon: Droplets, label: 'Real Fruit' },
  ];

  return (
    <div
      className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'} ${className}`}
      aria-label="Vibe and Vitality markers"
    >
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm font-medium text-[#1E1B18] ${
            compact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
          }`}
        >
          <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} strokeWidth={2.2} aria-hidden="true" />
          <span className="whitespace-nowrap">{label}</span>
        </span>
      ))}
    </div>
  );
};
