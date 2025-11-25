import { generateInsights } from './insightGenerator';
import { ForecastResult } from './types';

describe('Insight Generator', () => {
  it('should identify critical days', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'critical',
        criticalDays: ['2025-11-27', '2025-11-28'],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [
        {
          date: '2025-11-27',
          capacityHours: 8,
          meetingHours: 5,
          taskHours: 5,
          totalHours: 10,
          utilization: 1.25,
          riskLevel: 'critical',
          suggestedActions: [],
        },
        {
          date: '2025-11-28',
          capacityHours: 8,
          meetingHours: 6,
          taskHours: 4,
          totalHours: 10,
          utilization: 1.25,
          riskLevel: 'critical',
          suggestedActions: [],
        },
      ],
      overflowTasks: [],
    };

    const insights = generateInsights(forecast);
    
    expect(insights.length).toBeGreaterThan(0);
    const riskInsight = insights.find(i => i.type === 'risk');
    expect(riskInsight).toBeDefined();
    expect(riskInsight?.text).toContain('critical');
    expect(riskInsight?.severity).toBe('critical');
  });

  it('should report healthy capacity when no high-risk days', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'low',
        criticalDays: [],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [
        {
          date: '2025-11-27',
          capacityHours: 8,
          meetingHours: 2,
          taskHours: 3,
          totalHours: 5,
          utilization: 0.625,
          riskLevel: 'low',
          suggestedActions: [],
        },
      ],
      overflowTasks: [],
    };

    const insights = generateInsights(forecast);
    
    const riskInsight = insights.find(i => i.type === 'risk');
    expect(riskInsight?.text).toContain('healthy');
    expect(riskInsight?.severity).toBe('info');
  });

  it('should identify meeting-heavy schedules', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'medium',
        criticalDays: [],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [
        {
          date: '2025-11-27',
          capacityHours: 8,
          meetingHours: 6,
          taskHours: 1,
          totalHours: 7,
          utilization: 0.875,
          riskLevel: 'medium',
          suggestedActions: [],
        },
      ],
      overflowTasks: [],
    };

    const insights = generateInsights(forecast);
    
    const meetingInsight = insights.find(i => i.type === 'meetings');
    expect(meetingInsight).toBeDefined();
    expect(meetingInsight?.text).toContain('Meetings dominate');
  });

  it('should identify task-heavy schedules', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'medium',
        criticalDays: [],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [
        {
          date: '2025-11-27',
          capacityHours: 8,
          meetingHours: 1,
          taskHours: 6,
          totalHours: 7,
          utilization: 0.875,
          riskLevel: 'medium',
          suggestedActions: [],
        },
      ],
      overflowTasks: [],
    };

    const insights = generateInsights(forecast);
    
    const taskInsight = insights.find(i => i.type === 'tasks');
    expect(taskInsight).toBeDefined();
    expect(taskInsight?.text).toContain('Tasks drive');
  });

  it('should identify overflow tasks', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'critical',
        criticalDays: [],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [],
      overflowTasks: [
        { taskId: 't1', unallocatedHours: 3 },
        { taskId: 't2', unallocatedHours: 2 },
      ],
    };

    const insights = generateInsights(forecast);
    
    const overflowInsight = insights.find(i => i.text.includes('overflow'));
    expect(overflowInsight).toBeDefined();
    expect(overflowInsight?.severity).toBe('critical');
  });

  it('should limit insights to top 4', () => {
    const forecast: ForecastResult = {
      summary: {
        overallRisk: 'critical',
        criticalDays: ['2025-11-27'],
        windowStart: '2025-11-25',
        windowEnd: '2025-12-01',
      },
      days: [
        {
          date: '2025-11-27',
          capacityHours: 8,
          meetingHours: 6,
          taskHours: 4,
          totalHours: 10,
          utilization: 1.25,
          riskLevel: 'critical',
          suggestedActions: [],
        },
      ],
      overflowTasks: [{ taskId: 't1', unallocatedHours: 5 }],
    };

    const insights = generateInsights(forecast);
    
    expect(insights.length).toBeLessThanOrEqual(4);
  });
});
