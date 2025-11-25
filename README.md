# Capacity Compass – Workload Risk Forecaster

A production-ready web application that forecasts workload risk across upcoming days, helping you optimize task allocation and prevent burnout.

Live: https://pulse.asapabhi.me/

<img width="1026" height="797" alt="image" src="https://github.com/user-attachments/assets/bef710c9-9e7e-4987-b169-fe9c9c3dda12" />
<img width="1035" height="975" alt="image" src="https://github.com/user-attachments/assets/f6f215e1-987c-40d2-aa6d-028c70e6304e" />

## Overview

Capacity Compass analyzes your calendar events and task list to:
- **Forecast daily workload** across a configurable time window (7, 14, or 21 days)
- **Calculate risk levels** for each day based on utilization (low, medium, high, critical)
- **Suggest optimizations** like moving low-priority tasks to lighter days
- **Detect overflow** when tasks cannot fit within available capacity
- **Visualize workload** with an intuitive, interactive UI

This is a fully functional MVP that runs entirely locally with no external dependencies or API keys required.

## Features

### Core Forecasting
- **Per-day workload forecast** with meeting and task hour breakdown  
- **Risk scoring** based on utilization thresholds  
- **Backward allocation algorithm** that respects task priorities and due dates  
- **Overflow detection** for tasks that cannot fit in the window  

### AI-Powered Enhancements
- **Auto-estimated task hours** - Intelligent suggestions based on task title and priority  
- **Auto-run forecasting** - Automatic recalculation when data changes (with debounce)  
- **Capacity insights** - Executive-style summary of workload patterns  
- **Day explanations** - Detailed breakdown of why specific days are overloaded  
- **Smart suggestions panel** - Organized recommendations grouped by day and severity  

### User Experience
- **Interactive UI** for managing events and tasks  
- **Sample data loader** for instant demo  
- **Real-time updates** with loading states and timestamps  
- **Fully tested** core engine with comprehensive test coverage  

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Frontend**: React with Tailwind CSS
- **Testing**: Jest with ts-jest
- **Runtime**: Node.js

## How to Run Locally

### Prerequisites

- Node.js 18+ and npm


### Installation

```bash
# Clone the repository
git clone https://github.com/asapabhii/capacity-compass
cd capacity-compass

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.


## How the Algorithm Works

The core forecasting engine (`src/lib/capacityCompass.ts`) implements a backward allocation algorithm:

### Step 1: Initialize Date Window
- Creates a map of dates from today to today + N days
- Each day starts with full capacity (default 8 hours)

### Step 2: Compute Meeting Load
- Processes all calendar events
- Calculates duration and subtracts from available capacity
- Updates `freeHours` for each day

### Step 3: Sort Tasks by Priority
- Orders tasks: high → medium → low priority
- Secondary sort by due date (earliest first)

### Step 4: Backward Allocation
- For each task (in priority order):
  - Start from the task's due date
  - Work backward, allocating hours to days with available capacity
  - Stop when task is fully allocated or we run out of days
  - Track any unallocated hours as "overflow"

### Step 5: Calculate Risk Levels
- **Low**: < 70% utilization
- **Medium**: 70-89% utilization
- **High**: 90-110% utilization
- **Critical**: > 110% utilization

### Step 6: Generate Suggestions
- For overloaded days (high/critical risk):
  - Identify low-priority tasks
  - Find earlier days with available capacity
  - Suggest moving tasks to balance the load
- If no moves possible, flag as overflow

## AI-Powered Features

### 1. Auto-Estimated Task Hours

When creating a task, the app intelligently suggests duration based on the task title and priority.

**How it works:**
- Analyzes keywords in the task title (e.g., "review", "implement", "design")
- Applies priority multipliers (high priority tasks get +15%, low get -15%)
- Suggests hours in the range of 0.5h to 8h
- User can always override the suggestion

**Example:**
- "Review PR" → suggests ~1h
- "Implement authentication" → suggests ~4h
- "Design system architecture" → suggests ~6h

The heuristic is rule-based, transparent, and deterministic - no external AI APIs required.

### 2. Auto-Run Forecasting

The forecast automatically recalculates when you:
- Add, edit, or delete events
- Add, edit, or delete tasks
- Change configuration (window days, daily capacity)

**Behavior:**
- Uses a 500ms debounce to avoid excessive API calls
- Shows loading state during updates
- Displays "Last updated" timestamp
- Manual "Run Forecast" button still available for immediate refresh

### 3. Capacity Insights

Executive-style summary that highlights the most important patterns:

**Insights include:**
- Number of high-risk or critical days
- Whether meetings or tasks dominate your schedule
- Lightest and heaviest days
- Overflow warnings

**Example insights:**
- "2 critical days detected: Thursday, Friday"
- "Meetings dominate your schedule at 65% of total time"
- "Tuesday is your lightest day at 31% utilization"

### 4. Day Explanations

Click any day to see a detailed explanation of why it is overloaded:

**Includes:**
- Summary of utilization and capacity
- Breakdown of meetings vs tasks (with percentages)
- Top 5 contributors (meetings and tasks consuming most time)
- Detected patterns (deadline clusters, long meetings, etc.)

**Example:**
> "This day is critically overloaded at 118% of capacity. You have 6h of meetings and 5h of tasks, exceeding your 8h capacity by 3h. Most of the overload comes from tasks due on this day, including 'Refactor authentication module' (4h)."

### 5. Smart Suggestions Panel

Enhanced recommendations with better organization:

**Features:**
- Global view of all suggestions across the forecast window
- Grouped by day in chronological order
- Severity indicators for high-risk days
- Filters to selected day when you click a day card
- Shows suggestion count on each day card

**Suggestion types:**
- Move task to earlier day
- Flag overflow (when no capacity available)
- Reduce load warnings


## Future Integrations

The core engine is framework-agnostic and can be easily integrated with:

### Calendar Integration
- **Google Calendar**: OAuth 2.0 flow to fetch real events
- **Microsoft Outlook**: Microsoft Graph API integration
- **Apple Calendar**: CalDAV protocol support

### Task Management
- **Jira**: REST API to pull issues and estimates
- **Asana**: API integration for task data
- **Todoist**: Sync tasks with priorities and due dates
- **Linear**: GraphQL API for issue tracking

**Important**: This application requires **no environment variables** for deployment.

The app runs entirely with:
- Local state management
- Sample data generation
- Client-side forecasting logic

No API keys, database connections, or external services are required.

Built as a production-ready MVP for workload forecasting and risk management.
