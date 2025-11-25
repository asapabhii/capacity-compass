import { DayForecast, CalendarEvent, Task } from '@/lib/types';
import { explainDay } from '@/lib/dayExplainer';
import { getDayOfWeek, getMonthDay, parseDate } from '@/lib/dateUtils';
import RiskBadge from './RiskBadge';

interface DayExplanationProps {
  day: DayForecast;
  events: CalendarEvent[];
  tasks: Task[];
}

export default function DayExplanation({ day, events, tasks }: DayExplanationProps) {
  const explanation = explainDay(day, events, tasks);
  const date = parseDate(day.date);
  const dayOfWeek = getDayOfWeek(date);
  const monthDay = getMonthDay(date);

  return (
    <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {dayOfWeek}, {monthDay}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{day.date}</p>
        </div>
        <RiskBadge level={day.riskLevel} size="md" />
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">{explanation.summary}</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-elevated rounded-lg p-4 border border-white/10">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Meetings
          </div>
          <div className="text-2xl font-bold text-indigo-300">
            {explanation.breakdown.meetingHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {explanation.breakdown.meetingPercent}% of total
          </div>
        </div>
        <div className="bg-surface-elevated rounded-lg p-4 border border-white/10">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Tasks
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {explanation.breakdown.taskHours.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {explanation.breakdown.taskPercent}% of total
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      {explanation.topContributors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Top Contributors
          </h4>
          <div className="space-y-2">
            {explanation.topContributors.map((contributor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {contributor.type === 'meeting' ? '📅' : '✓'}
                  </span>
                  <span className="text-sm text-gray-300">{contributor.title}</span>
                </div>
                <span className="text-sm font-semibold text-gray-200">
                  {contributor.hours.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {explanation.patterns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Patterns Detected
          </h4>
          <div className="space-y-2">
            {explanation.patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-amber-500/10 border-l-2 border-amber-500 rounded-lg"
              >
                <span className="text-amber-400">•</span>
                <p className="text-sm text-amber-200">{pattern}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
