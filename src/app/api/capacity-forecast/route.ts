import { NextRequest, NextResponse } from 'next/server';
import { generateForecast } from '@/lib/capacityCompass';
import { CalendarEvent, Task, CapacityConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const events: CalendarEvent[] = body.events || [];
    const tasks: Task[] = body.tasks || [];
    const config: Partial<CapacityConfig> = body.config || {};
    
    // Basic validation
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'events must be an array' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'tasks must be an array' },
        { status: 400 }
      );
    }
    
    const result = generateForecast(events, tasks, config);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
