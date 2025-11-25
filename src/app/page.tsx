'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarEvent, Task, ForecastResult } from '@/lib/types';
import { getSampleEvents, getSampleTasks } from '@/lib/sampleData';
import DaySummaryCard from '@/components/DaySummaryCard';
import DayDetailPanel from '@/components/DayDetailPanel';
import EventForm from '@/components/EventForm';
import TaskForm from '@/components/TaskForm';
import RiskBadge from '@/components/RiskBadge';
import CapacityInsights from '@/components/CapacityInsights';
import DayExplanation from '@/components/DayExplanation';

// Debounce delay for auto-run (500ms)
const AUTO_RUN_DEBOUNCE_MS = 500;

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const runForecast = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/capacity-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          tasks,
          config: { windowDays, hoursPerDay },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecast');
      }

      const result = await response.json();
      setForecast(result);
      setLastUpdated(new Date());
      setSelectedDay(null);
    } catch (error) {
      console.error('Forecast error:', error);
      alert('Failed to generate forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [events, tasks, windowDays, hoursPerDay]);

  // Auto-run forecast with debounce when data changes
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only auto-run if we have data
    if (events.length > 0 || tasks.length > 0) {
      debounceTimerRef.current = setTimeout(() => {
        runForecast();
      }, AUTO_RUN_DEBOUNCE_MS);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [events, tasks, windowDays, hoursPerDay, runForecast]);

  const loadSampleData = () => {
    setEvents(getSampleEvents());
    setTasks(getSampleTasks());
  };

  const addEvent = (event: CalendarEvent) => {
    setEvents([...events, event]);
    setShowEventForm(false);
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    setShowTaskForm(false);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const selectedDayData = forecast?.days.find(d => d.date === selectedDay);

  // Get suggestions for selected day or all suggestions
  const allSuggestions = forecast?.days.flatMap(day => 
    day.suggestedActions.map(action => ({ ...action, date: day.date, dayRisk: day.riskLevel }))
  ) || [];

  const selectedDaySuggestions = selectedDay
    ? allSuggestions.filter(s => s.date === selectedDay)
    : allSuggestions;

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Hero Header */}
      <header className="border-b border-white/10 bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Capacity Compass
              </h1>
              <p className="text-lg text-gray-400">
                AI-powered workload forecasting and risk management
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg">
              <span className="text-sm font-medium text-indigo-300">AI COO Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Configuration Bar */}
        <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
          <div className="flex flex-wrap gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Forecast Window
              </label>
              <select
                value={windowDays}
                onChange={(e) => setWindowDays(Number(e.target.value))}
                className="px-4 py-2.5 bg-surface-elevated border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Daily Capacity
              </label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                min="1"
                max="24"
                className="px-4 py-2.5 bg-surface-elevated border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-24 font-medium"
              />
            </div>
            <div className="flex-1"></div>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={loadSampleData}
              className="px-6 py-2.5 bg-surface-elevated border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all font-medium"
            >
              Load Sample Data
            </button>
            <button
              onClick={runForecast}
              disabled={loading}
              className="px-8 py-2.5 gradient-neon text-white rounded-lg hover:gradient-neon-hover transition-all font-medium shadow-dark glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : 'Run Forecast'}
            </button>
          </div>
        </div>

        {/* Planner Panel */}
        <div className="bg-surface rounded-xl shadow-dark p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Planner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Events */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Events ({events.length})
                </h3>
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showEventForm ? 'Cancel' : '+ Add Event'}
                </button>
              </div>

              {showEventForm && (
                <div className="mb-4 p-5 bg-surface-elevated rounded-xl border border-white/10">
                  <EventForm onAdd={addEvent} />
                </div>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3 opacity-30">📅</div>
                    <p className="text-sm">No events added</p>
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="group flex justify-between items-start p-4 bg-surface-elevated border border-white/10 rounded-xl hover:bg-white/5 hover:border-indigo-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-100 truncate">{event.title}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {new Date(event.start).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-3 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Tasks ({tasks.length})
                </h3>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {showTaskForm ? 'Cancel' : '+ Add Task'}
                </button>
              </div>

              {showTaskForm && (
                <div className="mb-4 p-5 bg-surface-elevated rounded-xl border border-white/10">
                  <TaskForm onAdd={addTask} />
                </div>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="text-4xl mb-3 opacity-30">✓</div>
                    <p className="text-sm">No tasks added</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="group flex justify-between items-start p-4 bg-surface-elevated border border-white/10 rounded-xl hover:bg-white/5 hover:border-indigo-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-100 truncate">{task.title}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Due: {task.dueDate} · {task.estimatedHours}h · 
                          <span className="capitalize ml-1">{task.priority}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-3 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Results */}
        {forecast && (
          <>
            {/* Summary */}
            <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Forecast Summary</h2>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Overall Risk</span>
                  <RiskBadge level={forecast.summary.overallRisk} size="lg" />
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Period</div>
                  <div className="text-base font-semibold text-gray-100">
                    {forecast.summary.windowStart} to {forecast.summary.windowEnd}
                  </div>
                </div>
                {forecast.summary.criticalDays.length > 0 && (
                  <>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Critical Days</div>
                      <div className="text-base font-semibold text-red-400">
                        {forecast.summary.criticalDays.length}
                      </div>
                    </div>
                  </>
                )}
                {forecast.overflowTasks.length > 0 && (
                  <>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Overflow Tasks</div>
                      <div className="text-base font-semibold text-orange-400">
                        {forecast.overflowTasks.length}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {forecast.summary.criticalDays.length > 0 && (
                <div className="mt-6 p-4 bg-red-500/10 border-l-2 border-red-500 rounded-lg">
                  <p className="text-sm text-red-300">
                    ⚠️ High workload detected on {forecast.summary.criticalDays.length} day{forecast.summary.criticalDays.length > 1 ? 's' : ''}. Consider rebalancing tasks.
                  </p>
                </div>
              )}
            </div>

            {/* Capacity Insights */}
            <CapacityInsights forecast={forecast} />

            {/* Daily Breakdown */}
            <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Daily Breakdown</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {forecast.days.map(day => (
                  <DaySummaryCard
                    key={day.date}
                    day={day}
                    onClick={() => setSelectedDay(day.date)}
                    isSelected={selectedDay === day.date}
                  />
                ))}
              </div>
            </div>

            {/* Day Explanation (when day is selected) */}
            {selectedDayData && (
              <DayExplanation
                day={selectedDayData}
                events={events}
                tasks={tasks}
              />
            )}

            {/* Recommendations */}
            {allSuggestions.length > 0 && (
              <div className="bg-surface rounded-xl shadow-dark p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedDay ? `Recommendations for ${selectedDay}` : 'All Recommendations'}
                </h2>
                <div className="space-y-3">
                  {(selectedDay ? selectedDaySuggestions : allSuggestions.slice(0, 10)).map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-amber-500/10 border-l-2 border-amber-500 rounded-lg hover:bg-amber-500/15 transition-colors">
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                            {suggestion.date}
                          </span>
                          {suggestion.dayRisk && (suggestion.dayRisk === 'high' || suggestion.dayRisk === 'critical') && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
                              {suggestion.dayRisk}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-amber-200">{suggestion.reason}</div>
                        {suggestion.hoursToMove && (
                          <div className="text-xs text-amber-300 mt-2">
                            Move {suggestion.hoursToMove.toFixed(1)}h to {suggestion.toDate}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedDay && selectedDaySuggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No suggestions for this day</p>
                  </div>
                )}
              </div>
            )}

            {/* Day Detail (legacy panel) */}
            {selectedDayData && (
              <DayDetailPanel
                day={selectedDayData}
                events={events}
                tasks={tasks}
                onClose={() => setSelectedDay(null)}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!forecast && (
          <div className="bg-surface rounded-xl shadow-dark p-16 text-center border border-white/10">
            <div className="text-6xl mb-6 opacity-20">📊</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Forecast
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Add your events and tasks, or load sample data to see your workload forecast
            </p>
            <button
              onClick={loadSampleData}
              className="px-8 py-3 gradient-neon text-white rounded-lg hover:gradient-neon-hover transition-all font-medium shadow-dark glow-accent"
            >
              Load Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
