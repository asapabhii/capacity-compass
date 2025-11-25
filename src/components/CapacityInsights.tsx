import { ForecastResult } from '@/lib/types';
import { generateInsights, CapacityInsight } from '@/lib/insightGenerator';

interface CapacityInsightsProps {
  forecast: ForecastResult;
}

export default function CapacityInsights({ forecast }: CapacityInsightsProps) {
  const insights = generateInsights(forecast);

  const getIcon = (type: CapacityInsight['type']) => {
    switch (type) {
      case 'risk': return '⚠️';
      case 'meetings': return '📅';
      case 'tasks': return '✓';
      case 'time': return '⏰';
      default: return '💡';
    }
  };

  const getSeverityColor = (severity?: CapacityInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-300 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'info': return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-gray-300 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-4">Capacity Insights</h2>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
          >
            <span className="text-xl">{getIcon(insight.type)}</span>
            <p className="text-sm flex-1">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
