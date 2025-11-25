/**
 * Day Explanation Generator
 * 
 * Provides detailed explanations for why a particular day is overloaded or underutilized
 * Helps users understand the drivers of their workload
 */

import { DayForecast, CalendarEvent, Task } from './types';

export interface DayExplanation {
  summary: string;
  breakdown: {
    meetingHours: number;
    taskHours: number;
    meetingPercent: number;
    taskPercent: number;
  };
  mainDriver: 'meetings' | 'tasks' | 'balanced';
  topContributors: Array<{
    type: 'meeting' | 'task';
    title: string;
    hours: number;
  }>;
  patterns: string[];
}

/**
 * Generates a comprehensive explanation for a specific day
 */
export function explainDay(
  day: DayForecast,
  events: CalendarEvent[],
  tasks: Task[]
): DayExplanation {
  const { meetingHours, taskHours, totalHours, capacityHours, utilization } = day;
  
  // Calculate percentages
  const meetingPercent = totalHours > 0 ? Math.round((meetingHours / totalHours) * 100) : 0;
  const taskPercent = totalHours > 0 ? Math.round((taskHours / totalHours) * 100) : 0;
  
  // Determine main driver
  let mainDriver: 'meetings' | 'tasks' | 'balanced' = 'balanced';
  if (meetingPercent > 60) mainDriver = 'meetings';
  else if (taskPercent > 60) mainDriver = 'tasks';
  
  // Generate summary
  let summary = '';
  if (utilization > 1.1) {
    summary = `This day is critically overloaded at ${Math.round(utilization * 100)}% of capacity. `;
    summary += `You have ${meetingHours.toFixed(1)}h of meetings and ${taskHours.toFixed(1)}h of tasks, `;
    summary += `exceeding your ${capacityHours}h capacity by ${(totalHours - capacityHours).toFixed(1)}h.`;
  } else if (utilization > 0.9) {
    summary = `This day is near capacity at ${Math.round(utilization * 100)}% utilization. `;
    summary += `With ${meetingHours.toFixed(1)}h of meetings and ${taskHours.toFixed(1)}h of tasks, `;
    summary += `you have minimal buffer for unexpected work.`;
  } else if (utilization > 0.7) {
    summary = `This day is moderately busy at ${Math.round(utilization * 100)}% capacity. `;
    summary += `You have ${meetingHours.toFixed(1)}h of meetings and ${taskHours.toFixed(1)}h of tasks scheduled.`;
  } else if (utilization > 0) {
    summary = `This day is comfortably within capacity at ${Math.round(utilization * 100)}% utilization. `;
    summary += `You have ${meetingHours.toFixed(1)}h of meetings and ${taskHours.toFixed(1)}h of tasks.`;
  } else {
    summary = 'This day has no scheduled work. Consider using this time for planning or deep focus work.';
  }
  
  // Find top contributors
  const contributors: Array<{ type: 'meeting' | 'task'; title: string; hours: number }> = [];
  
  // Add meetings for this day
  const dayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate.toISOString().split('T')[0] === day.date;
  });
  
  dayEvents.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    contributors.push({
      type: 'meeting',
      title: event.title,
      hours: duration,
    });
  });
  
  // Add tasks (we don't have direct allocation data here, so we'll use tasks due on this day)
  const dayTasks = tasks.filter(t => t.dueDate === day.date);
  dayTasks.forEach(task => {
    contributors.push({
      type: 'task',
      title: task.title,
      hours: task.estimatedHours,
    });
  });
  
  // Sort by hours and take top 5
  const topContributors = contributors
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
  
  // Identify patterns
  const patterns: string[] = [];
  
  if (mainDriver === 'meetings' && meetingPercent > 70) {
    patterns.push(`Meetings occupy ${meetingPercent}% of your time, leaving little room for focus work`);
  }
  
  if (mainDriver === 'tasks' && taskPercent > 70) {
    patterns.push(`Task work dominates this day at ${taskPercent}% of total time`);
  }
  
  if (dayTasks.length > 3) {
    patterns.push(`Multiple tasks (${dayTasks.length}) are due on this day, creating a deadline cluster`);
  }
  
  const longMeetings = dayEvents.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return duration >= 2;
  });
  
  if (longMeetings.length > 0) {
    patterns.push(`${longMeetings.length} meeting${longMeetings.length > 1 ? 's' : ''} longer than 2 hours`);
  }
  
  if (utilization > 1 && day.suggestedActions.length === 0) {
    patterns.push('No earlier days have capacity to absorb overflow work');
  }
  
  return {
    summary,
    breakdown: {
      meetingHours,
      taskHours,
      meetingPercent,
      taskPercent,
    },
    mainDriver,
    topContributors,
    patterns,
  };
}
