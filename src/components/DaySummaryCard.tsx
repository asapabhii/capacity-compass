import { DayForecast } from '@/lib/types';
import { getDayOfWeek, getMonthDay, parseDate } from '@/lib/dateUtils';
import RiskBadge from './RiskBadge';
import UtilizationBar from './UtilizationBar';

interface DaySummaryCardProps {
  day: DayForecast;
  onClick: () => void;
  isSelected: boolean;
}

export default function DaySummaryCard({ day, onClick, isSelected }: DaySummaryCardProps) {
  const date = parseDate(day.date);
  const dayOfWeek = getDayOfWeek(date);
  const monthDay = getMonthDay(date);

  return (
    <div
      onClick={onClick}
      className={`bg-surface-elevated p-5 cursor-pointer transition-all min-w-[280px] rounded-xl border ${
        isSelected 
          ? 'border-indigo-500 shadow-dark-lg glow-accent' 
          : 'border-white/10 shadow-dark hover:border-indigo-500/50 hover:glow-accent'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{dayOfWeek}</div>
          <div className="text-xl font-bold text-white mt-1">{monthDay}</div>
        </div>
        <RiskBadge level={day.riskLevel} size="sm" />
      </div>

      <UtilizationBar
        utilization={day.utilization}
        meetingHours={day.meetingHours}
        taskHours={day.taskHours}
        capacityHours={day.capacityHours}
      />

      <div className="mt-4 text-xs text-gray-400">
        <div className="font-medium">{day.totalHours.toFixed(1)}h of {day.capacityHours}h capacity</div>
      </div>

      {day.suggestedActions.length > 0 && (
        <div className="mt-3 text-xs font-semibold text-indigo-300 bg-indigo-500/20 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 border border-indigo-500/30">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
          {day.suggestedActions.length} suggestion{day.suggestedActions.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
