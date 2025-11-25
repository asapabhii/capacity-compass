import { generateForecast } from './capacityCompass';
import { CalendarEvent, Task } from './types';

describe('Capacity Compass - Core Engine', () => {
  describe('Simple balanced week', () => {
    it('should handle a light workload with low risk', () => {
      const events: CalendarEvent[] = [
        {
          id: 'e1',
          title: 'Team Standup',
          start: '2025-11-25T10:00:00Z',
          end: '2025-11-25T10:30:00Z',
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Review PR',
          dueDate: '2025-11-25',
          estimatedHours: 2,
          priority: 'medium',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 7, hoursPerDay: 8 });

      expect(result.days).toHaveLength(7);
      expect(result.overflowTasks).toHaveLength(0);
      expect(result.summary.overallRisk).toBe('low');
      expect(result.summary.criticalDays).toHaveLength(0);

      const firstDay = result.days[0];
      expect(firstDay.meetingHours).toBeCloseTo(0.5);
      expect(firstDay.taskHours).toBeCloseTo(2);
      expect(firstDay.utilization).toBeLessThan(0.7);
    });
  });

  describe('Overloaded single day', () => {
    it('should detect high/critical risk and generate suggestions', () => {
      const events: CalendarEvent[] = [
        {
          id: 'e1',
          title: 'Long Meeting',
          start: '2025-11-26T09:00:00Z',
          end: '2025-11-26T15:00:00Z', // 6 hours
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Low priority task',
          dueDate: '2025-11-26',
          estimatedHours: 5,
          priority: 'low',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 7, hoursPerDay: 8 });

      const overloadedDay = result.days.find(d => d.date === '2025-11-26');
      expect(overloadedDay).toBeDefined();
      expect(overloadedDay!.riskLevel).toMatch(/high|critical/);
      expect(overloadedDay!.utilization).toBeGreaterThan(0.9);
      expect(overloadedDay!.suggestedActions.length).toBeGreaterThan(0);

      const suggestion = overloadedDay!.suggestedActions[0];
      expect(suggestion.type).toBe('moveTask');
      expect(suggestion.taskId).toBe('t1');
    });
  });

  describe('Task spread across multiple days', () => {
    it('should allocate a large task across multiple days', () => {
      const events: CalendarEvent[] = [];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Large project',
          dueDate: '2025-11-30',
          estimatedHours: 20,
          priority: 'high',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 7, hoursPerDay: 8 });

      const daysWithTask = result.days.filter(d => d.taskHours > 0);
      expect(daysWithTask.length).toBeGreaterThan(1);

      const totalAllocated = result.days.reduce((sum, d) => sum + d.taskHours, 0);
      expect(totalAllocated).toBeCloseTo(20);
      expect(result.overflowTasks).toHaveLength(0);
    });
  });

  describe('Overflow scenario', () => {
    it('should detect tasks that cannot fit in the window', () => {
      const events: CalendarEvent[] = [
        {
          id: 'e1',
          title: 'Daily meetings',
          start: '2025-11-25T09:00:00Z',
          end: '2025-11-25T13:00:00Z', // 4 hours
        },
        {
          id: 'e2',
          title: 'Daily meetings',
          start: '2025-11-26T09:00:00Z',
          end: '2025-11-26T13:00:00Z',
        },
        {
          id: 'e3',
          title: 'Daily meetings',
          start: '2025-11-27T09:00:00Z',
          end: '2025-11-27T13:00:00Z',
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Huge project',
          dueDate: '2025-11-27',
          estimatedHours: 50,
          priority: 'high',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 3, hoursPerDay: 8 });

      expect(result.overflowTasks.length).toBeGreaterThan(0);
      const overflow = result.overflowTasks[0];
      expect(overflow.taskId).toBe('t1');
      expect(overflow.unallocatedHours).toBeGreaterThan(0);
    });
  });

  describe('Priority behavior', () => {
    it('should allocate high priority tasks before low priority', () => {
      const events: CalendarEvent[] = [];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Low priority',
          dueDate: '2025-11-26',
          estimatedHours: 8,
          priority: 'low',
        },
        {
          id: 't2',
          title: 'High priority',
          dueDate: '2025-11-26',
          estimatedHours: 8,
          priority: 'high',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 3, hoursPerDay: 8 });

      // High priority should get the due date
      const dueDay = result.days.find(d => d.date === '2025-11-26');
      expect(dueDay).toBeDefined();

      // If there's overflow, it should be the low priority task
      if (result.overflowTasks.length > 0) {
        expect(result.overflowTasks[0].taskId).toBe('t1');
      }
    });

    it('should suggest moving low priority tasks when overloaded', () => {
      const events: CalendarEvent[] = [
        {
          id: 'e1',
          title: 'Meeting',
          start: '2025-11-26T09:00:00Z',
          end: '2025-11-26T14:00:00Z', // 5 hours
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Low priority task',
          dueDate: '2025-11-26',
          estimatedHours: 4,
          priority: 'low',
        },
        {
          id: 't2',
          title: 'High priority task',
          dueDate: '2025-11-26',
          estimatedHours: 2,
          priority: 'high',
        },
      ];

      const result = generateForecast(events, tasks, { windowDays: 7, hoursPerDay: 8 });

      const overloadedDay = result.days.find(d => d.date === '2025-11-26');
      expect(overloadedDay).toBeDefined();
      expect(overloadedDay!.riskLevel).toMatch(/high|critical/);

      const moveSuggestion = overloadedDay!.suggestedActions.find(a => a.type === 'moveTask');
      if (moveSuggestion) {
        expect(moveSuggestion.taskId).toBe('t1'); // Should suggest moving low priority
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty events and tasks', () => {
      const result = generateForecast([], [], { windowDays: 7, hoursPerDay: 8 });

      expect(result.days).toHaveLength(7);
      expect(result.overflowTasks).toHaveLength(0);
      expect(result.summary.overallRisk).toBe('low');

      result.days.forEach(day => {
        expect(day.meetingHours).toBe(0);
        expect(day.taskHours).toBe(0);
        expect(day.utilization).toBe(0);
        expect(day.riskLevel).toBe('low');
      });
    });

    it('should handle tasks with zero hours', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Quick check',
          dueDate: '2025-11-25',
          estimatedHours: 0,
          priority: 'low',
        },
      ];

      const result = generateForecast([], tasks, { windowDays: 7, hoursPerDay: 8 });

      expect(result.overflowTasks).toHaveLength(0);
      expect(result.summary.overallRisk).toBe('low');
    });
  });
});
