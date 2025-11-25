export type EventType = "meeting" | "focus" | "personal";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
  type?: EventType;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  dueDate: string;      // ISO date "YYYY-MM-DD"
  estimatedHours: number;
  priority: TaskPriority;
}

export interface CapacityConfig {
  hoursPerDay: number;
  windowDays: number;
  timezone?: string;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface SuggestedAction {
  type: "moveTask" | "downgradePriority" | "flagOverflow";
  taskId: string;
  fromDate?: string;
  toDate?: string;
  hoursToMove?: number;
  reason?: string;
}

export interface DayForecast {
  date: string; // "YYYY-MM-DD"
  capacityHours: number;
  meetingHours: number;
  taskHours: number;
  totalHours: number;
  utilization: number; // 0.0 - N
  riskLevel: RiskLevel;
  suggestedActions: SuggestedAction[];
}

export interface OverflowTask {
  taskId: string;
  unallocatedHours: number;
}

export interface ForecastSummary {
  overallRisk: RiskLevel;
  criticalDays: string[];
  windowStart: string;
  windowEnd: string;
}

export interface ForecastResult {
  summary: ForecastSummary;
  days: DayForecast[];
  overflowTasks: OverflowTask[];
}

// Internal tracking structures
export interface TaskAllocation {
  taskId: string;
  date: string;
  hours: number;
  priority: TaskPriority;
  title: string;
}
