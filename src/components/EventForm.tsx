import { useState } from 'react';
import { CalendarEvent } from '@/lib/types';

interface EventFormProps {
  onAdd: (event: CalendarEvent) => void;
}

export default function EventForm({ onAdd }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const event: CalendarEvent = {
      id: `e-${Date.now()}`,
      title,
      start: `${date}T${startTime}:00Z`,
      end: `${date}T${endTime}:00Z`,
      type: 'meeting',
    };

    onAdd(event);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Event Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Team meeting"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Start
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            End
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-white/10 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full gradient-neon text-white py-3 rounded-lg hover:gradient-neon-hover transition-all font-semibold shadow-dark"
      >
        Add Event
      </button>
    </form>
  );
}
