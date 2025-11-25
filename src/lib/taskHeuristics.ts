/**
 * Task Hours Estimation Heuristics
 * 
 * Provides intelligent suggestions for task duration based on:
 * - Keywords in the task title
 * - Task priority level
 * 
 * This is a rule-based, deterministic system designed to be:
 * - Transparent and explainable
 * - Easy to extend
 * - Fast to compute
 * - Unit testable
 */

import { TaskPriority } from './types';

// Keyword categories with associated base hour ranges
const KEYWORD_PATTERNS = {
  // Quick tasks: 0.5-1 hour
  quick: {
    keywords: ['review', 'sync', 'reply', 'email', 'call', 'follow-up', 'check', 'update', 'fix bug'],
    baseHours: 0.75,
    range: [0.5, 1],
  },
  // Medium tasks: 1.5-3 hours
  medium: {
    keywords: ['spec', 'plan', 'proposal', 'design', 'outline', 'strategy', 'document', 'write', 'prepare', 'analyze'],
    baseHours: 2,
    range: [1.5, 3],
  },
  // Large tasks: 3-6 hours
  large: {
    keywords: ['implement', 'build', 'integration', 'refactor', 'migrate', 'feature', 'develop', 'create', 'setup'],
    baseHours: 4,
    range: [3, 6],
  },
  // Very large tasks: 6-8 hours
  veryLarge: {
    keywords: ['architecture', 'infrastructure', 'system', 'platform', 'framework', 'overhaul', 'redesign'],
    baseHours: 6,
    range: [6, 8],
  },
};

// Priority multipliers
const PRIORITY_MULTIPLIERS = {
  low: 0.85,    // Reduce estimate by 15%
  medium: 1.0,  // No change
  high: 1.15,   // Increase estimate by 15%
};

/**
 * Estimates task hours based on title and priority
 * 
 * @param title - The task title to analyze
 * @param priority - The task priority level
 * @returns Suggested hours (rounded to nearest 0.5)
 */
export function estimateTaskHours(title: string, priority: TaskPriority): number {
  if (!title || title.trim().length === 0) {
    return 2; // Default fallback
  }

  const lowerTitle = title.toLowerCase();
  
  // Find matching category
  let matchedCategory = KEYWORD_PATTERNS.medium; // Default to medium
  let matchCount = 0;

  for (const [categoryName, category] of Object.entries(KEYWORD_PATTERNS)) {
    const matches = category.keywords.filter(keyword => lowerTitle.includes(keyword)).length;
    if (matches > matchCount) {
      matchCount = matches;
      matchedCategory = category;
    }
  }

  // Apply base hours
  let estimatedHours = matchedCategory.baseHours;

  // Apply priority multiplier
  const multiplier = PRIORITY_MULTIPLIERS[priority];
  estimatedHours *= multiplier;

  // Clamp to category range
  const [min, max] = matchedCategory.range;
  estimatedHours = Math.max(min, Math.min(max, estimatedHours));

  // Round to nearest 0.5
  return Math.round(estimatedHours * 2) / 2;
}

/**
 * Gets a human-readable explanation of why a particular estimate was suggested
 * 
 * @param title - The task title
 * @param priority - The task priority
 * @returns Explanation string
 */
export function getEstimationExplanation(title: string, priority: TaskPriority): string {
  const lowerTitle = title.toLowerCase();
  
  // Find matched keywords
  const matchedKeywords: string[] = [];
  let categoryName = 'medium';
  
  for (const [name, category] of Object.entries(KEYWORD_PATTERNS)) {
    const matches = category.keywords.filter(keyword => lowerTitle.includes(keyword));
    if (matches.length > 0) {
      matchedKeywords.push(...matches);
      categoryName = name;
    }
  }

  if (matchedKeywords.length === 0) {
    return 'Based on typical task duration';
  }

  const keywordText = matchedKeywords.slice(0, 2).map(k => `"${k}"`).join(', ');
  const priorityText = priority !== 'medium' ? ` and ${priority} priority` : '';
  
  return `Based on ${keywordText}${priorityText}`;
}
