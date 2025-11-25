import { CalendarEvent, Task } from './types';

export function getSampleEvents(): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const formatDateTime = (date: Date, hour: number, minute: number = 0): string => {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  
  const day0 = new Date(today);
  const day1 = new Date(today);
  day1.setDate(day1.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);
  const day4 = new Date(today);
  day4.setDate(day4.getDate() + 4);
  
  return [
    {
      id: 'e1',
      title: 'Daily Standup',
      start: formatDateTime(day0, 9, 0),
      end: formatDateTime(day0, 9, 30),
      type: 'meeting',
    },
    {
      id: 'e2',
      title: 'Sprint Planning',
      start: formatDateTime(day0, 14, 0),
      end: formatDateTime(day0, 16, 0),
      type: 'meeting',
    },
    {
      id: 'e3',
      title: 'Daily Standup',
      start: formatDateTime(day1, 9, 0),
      end: formatDateTime(day1, 9, 30),
      type: 'meeting',
    },
    {
      id: 'e4',
      title: 'Client Demo',
      start: formatDateTime(day1, 15, 0),
      end: formatDateTime(day1, 16, 30),
      type: 'meeting',
    },
    {
      id: 'e5',
      title: 'Daily Standup',
      start: formatDateTime(day2, 9, 0),
      end: formatDateTime(day2, 9, 30),
      type: 'meeting',
    },
    {
      id: 'e6',
      title: 'Architecture Review',
      start: formatDateTime(day2, 10, 0),
      end: formatDateTime(day2, 12, 0),
      type: 'meeting',
    },
    {
      id: 'e7',
      title: '1-on-1 with Manager',
      start: formatDateTime(day2, 14, 0),
      end: formatDateTime(day2, 15, 0),
      type: 'meeting',
    },
    {
      id: 'e8',
      title: 'Daily Standup',
      start: formatDateTime(day3, 9, 0),
      end: formatDateTime(day3, 9, 30),
      type: 'meeting',
    },
    {
      id: 'e9',
      title: 'Team Retrospective',
      start: formatDateTime(day3, 16, 0),
      end: formatDateTime(day3, 17, 30),
      type: 'meeting',
    },
    {
      id: 'e10',
      title: 'Daily Standup',
      start: formatDateTime(day4, 9, 0),
      end: formatDateTime(day4, 9, 30),
      type: 'meeting',
    },
  ];
}

export function getSampleTasks(): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const day1 = new Date(today);
  day1.setDate(day1.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);
  const day5 = new Date(today);
  day5.setDate(day5.getDate() + 5);
  const day6 = new Date(today);
  day6.setDate(day6.getDate() + 6);
  
  return [
    {
      id: 't1',
      title: 'Fix critical bug in payment flow',
      dueDate: formatDate(day1),
      estimatedHours: 4,
      priority: 'high',
    },
    {
      id: 't2',
      title: 'Implement user profile page',
      dueDate: formatDate(day3),
      estimatedHours: 8,
      priority: 'high',
    },
    {
      id: 't3',
      title: 'Write API documentation',
      dueDate: formatDate(day5),
      estimatedHours: 6,
      priority: 'medium',
    },
    {
      id: 't4',
      title: 'Update dependencies',
      dueDate: formatDate(day6),
      estimatedHours: 3,
      priority: 'low',
    },
    {
      id: 't5',
      title: 'Code review for team PRs',
      dueDate: formatDate(day2),
      estimatedHours: 2,
      priority: 'medium',
    },
    {
      id: 't6',
      title: 'Refactor authentication module',
      dueDate: formatDate(day6),
      estimatedHours: 10,
      priority: 'medium',
    },
    {
      id: 't7',
      title: 'Update README',
      dueDate: formatDate(day5),
      estimatedHours: 1,
      priority: 'low',
    },
  ];
}
