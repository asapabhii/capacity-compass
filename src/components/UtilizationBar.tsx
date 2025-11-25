interface UtilizationBarProps {
  utilization: number;
  meetingHours: number;
  taskHours: number;
  capacityHours: number;
}

export default function UtilizationBar({
  utilization,
  meetingHours,
  taskHours,
  capacityHours,
}: UtilizationBarProps) {
  const meetingPercent = (meetingHours / capacityHours) * 100;
  const taskPercent = (taskHours / capacityHours) * 100;

  const getColor = () => {
    if (utilization < 0.7) return 'bg-emerald-500';
    if (utilization < 0.9) return 'bg-amber-500';
    if (utilization <= 1.1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-indigo-500 absolute left-0 transition-all"
          style={{ width: `${Math.min(meetingPercent, 100)}%` }}
        />
        <div
          className={`h-full ${getColor()} absolute left-0 transition-all`}
          style={{
            left: `${Math.min(meetingPercent, 100)}%`,
            width: `${Math.min(taskPercent, 100 - meetingPercent)}%`,
          }}
        />
        {utilization > 1 && (
          <div
            className="h-full bg-red-600 opacity-50 absolute"
            style={{
              left: '100%',
              width: `${Math.min((utilization - 1) * 100, 50)}%`,
            }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            {meetingHours.toFixed(1)}h meetings
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 ${getColor()} rounded-full`}></span>
            {taskHours.toFixed(1)}h tasks
          </span>
        </div>
        <span className="font-semibold text-gray-200">
          {(utilization * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
