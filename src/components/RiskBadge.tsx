import { RiskLevel } from '@/lib/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const colors = {
    low: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-1.5',
    lg: 'text-base px-5 py-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${colors[level]} ${sizes[size]} capitalize`}
    >
      {level}
    </span>
  );
}
