import { estimateTaskHours, getEstimationExplanation } from './taskHeuristics';

describe('Task Hours Estimation Heuristics', () => {
  describe('estimateTaskHours', () => {
    it('should suggest short duration for quick tasks', () => {
      const reviewEstimate = estimateTaskHours('Review PR', 'medium');
      expect(reviewEstimate).toBeGreaterThanOrEqual(0.5);
      expect(reviewEstimate).toBeLessThanOrEqual(1);
      
      const syncEstimate = estimateTaskHours('Quick sync call', 'medium');
      expect(syncEstimate).toBeGreaterThanOrEqual(0.5);
      expect(syncEstimate).toBeLessThanOrEqual(1);
      
      const emailEstimate = estimateTaskHours('Reply to email', 'medium');
      expect(emailEstimate).toBeGreaterThanOrEqual(0.5);
      expect(emailEstimate).toBeLessThanOrEqual(1);
    });

    it('should suggest medium duration for planning tasks', () => {
      const estimate = estimateTaskHours('Write project spec', 'medium');
      expect(estimate).toBeGreaterThanOrEqual(1.5);
      expect(estimate).toBeLessThanOrEqual(3);
      
      expect(estimateTaskHours('Design new feature', 'medium')).toBeGreaterThanOrEqual(1.5);
      expect(estimateTaskHours('Prepare proposal', 'medium')).toBeGreaterThanOrEqual(1.5);
    });

    it('should suggest large duration for implementation tasks', () => {
      const estimate = estimateTaskHours('Implement authentication', 'medium');
      expect(estimate).toBeGreaterThanOrEqual(3);
      expect(estimate).toBeLessThanOrEqual(6);
      
      expect(estimateTaskHours('Build new feature', 'medium')).toBeGreaterThanOrEqual(3);
      expect(estimateTaskHours('Refactor codebase', 'medium')).toBeGreaterThanOrEqual(3);
    });

    it('should suggest very large duration for architecture tasks', () => {
      const estimate = estimateTaskHours('Design system architecture', 'medium');
      expect(estimate).toBeGreaterThanOrEqual(6);
      expect(estimate).toBeLessThanOrEqual(8);
      
      expect(estimateTaskHours('Infrastructure overhaul', 'medium')).toBeGreaterThanOrEqual(6);
    });

    it('should adjust estimates based on priority', () => {
      const lowPriority = estimateTaskHours('Implement feature', 'low');
      const mediumPriority = estimateTaskHours('Implement feature', 'medium');
      const highPriority = estimateTaskHours('Implement feature', 'high');
      
      expect(lowPriority).toBeLessThan(mediumPriority);
      expect(highPriority).toBeGreaterThan(mediumPriority);
    });

    it('should return default for empty or generic titles', () => {
      expect(estimateTaskHours('', 'medium')).toBe(2);
      expect(estimateTaskHours('Do something', 'medium')).toBe(2);
    });

    it('should round to nearest 0.5 hours', () => {
      const estimates = [
        estimateTaskHours('Review code', 'low'),
        estimateTaskHours('Write spec', 'high'),
        estimateTaskHours('Build feature', 'medium'),
      ];
      
      estimates.forEach(estimate => {
        expect(estimate % 0.5).toBe(0);
      });
    });
  });

  describe('getEstimationExplanation', () => {
    it('should provide explanation for matched keywords', () => {
      const explanation = getEstimationExplanation('Review PR and sync', 'medium');
      expect(explanation).toContain('review');
    });

    it('should mention priority when not medium', () => {
      const explanation = getEstimationExplanation('Implement feature', 'high');
      expect(explanation).toContain('high priority');
    });

    it('should provide default explanation for generic tasks', () => {
      const explanation = getEstimationExplanation('Do work', 'medium');
      expect(explanation).toContain('typical');
    });
  });
});
