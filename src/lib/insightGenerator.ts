/**
 * Capacity Insights Generator
 * 
 * Generates executive-style insights from forecast data
 * Provides concise, actionable summaries of workload patterns
 */

import { ForecastResult, DayForecast } from './types';

export interface CapacityInsight {
  type: 'risk' | 'meetings' | 'tasks' | 'time';
  text: string;
  severity?: 'info' | 'warning' | 'critical';
}

/**
 * Generates a set of insights from forecast data
 * Focuses on the most informative patterns and extremes
 */
export function generateInsights(forecast: ForecastResult): CapacityInsight[] {
  const insights: CapacityInsight[] = [];
  
  // 1. Risk assessment
  const criticalDays = forecast.days.filter(d => d.riskLevel === 'critical');
  const highDays = forecast.days.filter(d => d.riskLevel === 'high');
  
  if (criticalDays.length > 0) {
    const dayNames = criticalDays.map(d => getDayName(d.date)).join(', ');
    insights.push({
      type: 'risk',
      text: `${criticalDays.length} critical day${criticalDays.length > 1 ? 's' : ''} detected: ${dayNames}`,
      severity: 'critical',
    });
  } else if (highDays.length > 0) {
    const dayNames = highDays.map(d => getDayName(d.date)).join(', ');
    insights.push({
      type: 'risk',
      text: `${highDays.length} high-risk day${highDays.length > 1 ? 's' : ''}: ${dayNames}`,
      severity: 'warning',
    });
  } else {
    insights.push({
      type: 'risk',
      text: 'No critical days — your capacity looks healthy',
      severity: 'info',
    });
  }
  
  // 2. Meeting vs Task analysis
  const totalMeetingHours = forecast.days.reduce((sum, d) => sum + d.meetingHours, 0);
  const totalTaskHours = forecast.days.reduce((sum, d) => sum + d.taskHours, 0);
  const totalHours = totalMeetingHours + totalTaskHours;
  
  if (totalHours > 0) {
    const meetingPercent = Math.round((totalMeetingHours / totalHours) * 100);
    const taskPercent = Math.round((totalTaskHours / totalHours) * 100);
    
    if (meetingPercent > 60) {
      insights.push({
        type: 'meetings',
        text: `Meetings dominate your schedule at ${meetingPercent}% of total time`,
        severity: 'warning',
      });
    } else if (taskPercent > 60) {
      insights.push({
        type: 'tasks',
        text: `Tasks drive most of your workload at ${taskPercent}% of total time`,
        severity: 'info',
      });
    } else {
      insights.push({
        type: 'time',
        text: `Balanced split: ${meetingPercent}% meetings, ${taskPercent}% tasks`,
        severity: 'info',
      });
    }
  }
  
  // 3. Best and worst days
  const daysWithWork = forecast.days.filter(d => d.totalHours > 0);
  if (daysWithWork.length > 0) {
    const lightestDay = daysWithWork.reduce((min, d) => 
      d.utilization < min.utilization ? d : min
    );
    const heaviestDay = daysWithWork.reduce((max, d) => 
      d.utilization > max.utilization ? d : max
    );
    
    if (lightestDay.utilization < 0.5) {
      insights.push({
        type: 'time',
        text: `${getDayName(lightestDay.date)} is your lightest day at ${Math.round(lightestDay.utilization * 100)}% utilization`,
        severity: 'info',
      });
    }
    
    if (heaviestDay.utilization > 0.9) {
      insights.push({
        type: 'time',
        text: `${getDayName(heaviestDay.date)} is your heaviest day at ${Math.round(heaviestDay.utilization * 100)}% capacity`,
        severity: heaviestDay.utilization > 1.1 ? 'critical' : 'warning',
      });
    }
  }
  
  // 4. Overflow warning
  if (forecast.overflowTasks.length > 0) {
    const totalOverflow = forecast.overflowTasks.reduce((sum, t) => sum + t.unallocatedHours, 0);
    insights.push({
      type: 'tasks',
      text: `${forecast.overflowTasks.length} task${forecast.overflowTasks.length > 1 ? 's' : ''} won't fit (${totalOverflow.toFixed(1)}h overflow)`,
      severity: 'critical',
    });
  }
  
  return insights.slice(0, 4); // Return top 4 insights
}

/**
 * Gets a friendly day name from a date string
 */
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}
