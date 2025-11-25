import { DayForecast, CalendarEvent, Task } from '@/lib/types';
import { parseDate, getDayOfWeek, getMonthDay } from '@/lib/dateUtils';
import RiskBadge from './RiskBadge';

interface DayDetailPanelProps {
  day: DayForecast;
  events: CalendarEvent[];
  tasks: Task[];
  onClose: () => void;
}

export default function DayDetailPanel({ day, events, tasks, onClose }: DayDetailPanelProps) {
  const date = parseDate(day.date);
  const dayOfWeek = getDayOfWeek(date);
  const monthDay = getMonthDay(date);

  const dayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate.toISOString().split('T')[0] === day.date;
  });

  return (
    <div className="bg-surface rounded-xl shadow-dark-lg p-8 border border-white/10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-bold text-white">
            {dayOfWeek}, {monthDay}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{day.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <RiskBadge level={day.riskLevel} size="md" />
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-elevated rounded-xl p-4 border border-white/10">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Capacity</div>
          <div className="text-2xl font-bold text-white">{day.capacityHours}h</div>
        </div>
        <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Meetings</div>
          <div className="text-2xl font-bold text-indigo-300">{day.meetingHours.toFixed(1)}h</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">Tasks</div>
          <div className="text-2xl font-bold text-emerald-300">{day.taskHours.toFixed(1)}h</div>
        </div>
      </div>

      {dayEvents.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Meetings</h4>
          <div className="space-y-3">
            {dayEvents.map(event => {
              const start = new Date(event.start);
              const end = new Date(event.end);
              const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              return (
                <div key={event.id} className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 hover:bg-indigo-500/15 transition-colors">
                  <div className="font-semibold text-white">{event.title}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {duration.toFixed(1)}h
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {day.suggestedActions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Suggestions</h4>
          <div className="space-y-3">
            {day.suggestedActions.map((action, idx) => (
              <div key={idx} className="bg-amber-500/10 border-l-2 border-amber-500 rounded-lg p-4 hover:bg-amber-500/15 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-300 capitalize">
                      {action.type.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-amber-200 mt-1">{action.reason}</div>
                    {action.hoursToMove && (
                      <div className="text-xs text-amber-300 mt-2 font-medium">
                        Move {action.hoursToMove.toFixed(1)}h to {action.toDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {day.taskHours === 0 && dayEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3 opacity-20">📭</div>
          <div className="text-sm">No meetings or tasks scheduled</div>
        </div>
      )}
    </div>
  );
}
