import { useState, useEffect } from 'react';
import { Task, TaskPriority } from '@/lib/types';
import { estimateTaskHours, getEstimationExplanation } from '@/lib/taskHeuristics';

interface TaskFormProps {
  onAdd: (task: Task) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [hours, setHours] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [userModifiedHours, setUserModifiedHours] = useState(false);
  const [suggestedHours, setSuggestedHours] = useState<number | null>(null);

  // Auto-estimate hours when title or priority changes
  useEffect(() => {
    if (title.trim() && !userModifiedHours) {
      const estimated = estimateTaskHours(title, priority);
      setSuggestedHours(estimated);
      setHours(estimated.toString());
    }
  }, [title, priority, userModifiedHours]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(e.target.value);
    setUserModifiedHours(true);
    setSuggestedHours(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const task: Task = {
      id: `t-${Date.now()}`,
      title,
      dueDate,
      estimatedHours: parseFloat(hours) || 0,
      priority,
    };

    onAdd(task);
    setTitle('');
    setHours('');
    setUserModifiedHours(false);
    setSuggestedHours(null);
  };

  const explanation = title.trim() && suggestedHours !== null 
    ? getEstimationExplanation(title, priority)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Task Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Implement feature X"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Hours
          </label>
          <input
            type="number"
            value={hours}
            onChange={handleHoursChange}
            min="0"
            step="0.5"
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Auto"
          />
          {suggestedHours !== null && explanation && (
            <div className="mt-1 text-xs text-indigo-400">
              💡 {explanation}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="w-full gradient-neon text-white py-3 rounded-lg hover:gradient-neon-hover transition-all font-semibold shadow-dark"
      >
        Add Task
      </button>
    </form>
  );
}
