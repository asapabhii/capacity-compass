/**
 * Capacity Compass - Core Forecasting Engine
 * Pure functions with no framework dependencies
 */

import {
  CalendarEvent,
  Task,
  CapacityConfig,
  ForecastResult,
  DayForecast,
  RiskLevel,
  SuggestedAction,
  OverflowTask,
  TaskAllocation,
} from './types';
import {
  formatDate,
  addDays,
  subtractDays,
  calculateDurationHours,
  getDateFromTimestamp,
  parseDate,
} from './dateUtils';

const DEFAULT_CONFIG: CapacityConfig = {
  hoursPerDay: 8,
  windowDays: 7,
  timezone: 'UTC',
};

interface DayData {
  date: string;
  capacityHours: number;
  meetingHours: number;
  taskHours: number;
  freeHours: number;
  allocations: TaskAllocation[];
}

export function generateForecast(
  events: CalendarEvent[],
  tasks: Task[],
  config: Partial<CapacityConfig> = {}
): ForecastResult {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Step 0: Initialize date range and day map
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const windowStart = formatDate(today);
  const windowEnd = formatDate(addDays(today, fullConfig.windowDays - 1));
  
  const dayMap = new Map<string, DayData>();
  
  for (let i = 0; i < fullConfig.windowDays; i++) {
    const date = formatDate(addDays(today, i));
    dayMap.set(date, {
      date,
      capacityHours: fullConfig.hoursPerDay,
      meetingHours: 0,
      taskHours: 0,
      freeHours: fullConfig.hoursPerDay,
      allocations: [],
    });
  }
  
  // Step 1: Compute meeting load
  for (const event of events) {
    const eventDate = getDateFromTimestamp(event.start);
    const dayData = dayMap.get(eventDate);
    
    if (dayData) {
      const duration = calculateDurationHours(event.start, event.end);
      dayData.meetingHours += duration;
      dayData.freeHours = Math.max(0, dayData.capacityHours - dayData.meetingHours);
    }
  }
  
  // Step 2: Sort tasks by priority and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.dueDate.localeCompare(b.dueDate);
  });
  
  // Step 3: Allocate task hours backwards from due dates
  const overflowTasks: OverflowTask[] = [];
  
  for (const task of sortedTasks) {
    let taskHoursRemaining = task.estimatedHours;
    let currentDate = parseDate(task.dueDate);
    
    // Clamp to window
    const windowEndDate = parseDate(windowEnd);
    if (currentDate > windowEndDate) {
      currentDate = windowEndDate;
    }
    if (currentDate < today) {
      currentDate = today;
    }
    
    while (taskHoursRemaining > 0 && currentDate >= today) {
      const dateStr = formatDate(currentDate);
      const dayData = dayMap.get(dateStr);
      
      if (dayData && dayData.freeHours > 0) {
        const allocated = Math.min(dayData.freeHours, taskHoursRemaining);
        dayData.freeHours -= allocated;
        dayData.taskHours += allocated;
        dayData.allocations.push({
          taskId: task.id,
          date: dateStr,
          hours: allocated,
          priority: task.priority,
          title: task.title,
        });
        taskHoursRemaining -= allocated;
      }
      
      currentDate = subtractDays(currentDate, 1);
    }
    
    if (taskHoursRemaining > 0) {
      overflowTasks.push({
        taskId: task.id,
        unallocatedHours: taskHoursRemaining,
      });
    }
  }
  
  // Step 4: Compute utilization and risk levels
  const days: DayForecast[] = [];
  const criticalDays: string[] = [];
  
  for (const [date, dayData] of dayMap) {
    const totalHours = dayData.meetingHours + dayData.taskHours;
    const utilization = totalHours / dayData.capacityHours;
    const riskLevel = calculateRiskLevel(utilization);
    
    if (riskLevel === 'critical') {
      criticalDays.push(date);
    }
    
    days.push({
      date,
      capacityHours: dayData.capacityHours,
      meetingHours: dayData.meetingHours,
      taskHours: dayData.taskHours,
      totalHours,
      utilization,
      riskLevel,
      suggestedActions: [],
    });
  }
  
  // Sort days by date
  days.sort((a, b) => a.date.localeCompare(b.date));
  
  // Step 5: Generate suggestions
  generateSuggestions(days, dayMap);
  
  // Step 6: Compute summary
  const overallRisk = calculateOverallRisk(days);
  
  return {
    summary: {
      overallRisk,
      criticalDays,
      windowStart,
      windowEnd,
    },
    days,
    overflowTasks,
  };
}

function calculateRiskLevel(utilization: number): RiskLevel {
  if (utilization < 0.7) return 'low';
  if (utilization < 0.9) return 'medium';
  if (utilization <= 1.1) return 'high';
  return 'critical';
}

function calculateOverallRisk(days: DayForecast[]): RiskLevel {
  if (days.some(d => d.riskLevel === 'critical')) return 'critical';
  if (days.some(d => d.riskLevel === 'high')) return 'high';
  if (days.some(d => d.riskLevel === 'medium')) return 'medium';
  return 'low';
}

function generateSuggestions(days: DayForecast[], dayMap: Map<string, DayData>): void {
  for (const day of days) {
    if (day.riskLevel === 'high' || day.riskLevel === 'critical') {
      const dayData = dayMap.get(day.date);
      if (!dayData) continue;
      
      // Find low priority tasks to move
      const lowPriorityAllocations = dayData.allocations
        .filter(a => a.priority === 'low')
        .sort((a, b) => b.hours - a.hours);
      
      for (const allocation of lowPriorityAllocations) {
        // Look for earlier days with capacity
        const earlierDay = findEarlierDayWithCapacity(days, day.date, allocation.hours);
        
        if (earlierDay) {
          day.suggestedActions.push({
            type: 'moveTask',
            taskId: allocation.taskId,
            fromDate: day.date,
            toDate: earlierDay.date,
            hoursToMove: allocation.hours,
            reason: `Move "${allocation.title}" to ${earlierDay.date} to reduce overload`,
          });
          break; // One suggestion per overloaded day for simplicity
        }
      }
      
      // If no move found, flag overflow
      if (day.suggestedActions.length === 0) {
        day.suggestedActions.push({
          type: 'flagOverflow',
          taskId: '',
          reason: `Day exceeds ${day.riskLevel === 'critical' ? '110%' : '90%'} utilization with no earlier capacity available`,
        });
      }
    }
  }
}

function findEarlierDayWithCapacity(
  days: DayForecast[],
  fromDate: string,
  hoursNeeded: number
): DayForecast | null {
  for (const day of days) {
    if (day.date >= fromDate) continue;
    if (day.riskLevel === 'low' || day.riskLevel === 'medium') {
      const available = day.capacityHours - day.totalHours;
      if (available >= hoursNeeded) {
        return day;
      }
    }
  }
  return null;
}
