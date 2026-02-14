import { describe, it, expect } from 'vitest';
import { calculateEloChange, DEFAULT_ELO } from './elo';

describe('calculateEloChange', () => {
  it('should return positive change for winner and negative for loser', () => {
    const { winnerChange, loserChange } = calculateEloChange(1200, 1200);
    
    expect(winnerChange).toBeGreaterThan(0);
    expect(loserChange).toBeLessThan(0);
  });

  it('should have changes sum to approximately zero', () => {
    const { winnerChange, loserChange } = calculateEloChange(1200, 1200);
    
    // Due to rounding, might not be exactly zero
    expect(Math.abs(winnerChange + loserChange)).toBeLessThanOrEqual(1);
  });

  it('should give smaller gain when higher-rated player wins', () => {
    const highBeatsLow = calculateEloChange(1400, 1200);
    const equalMatch = calculateEloChange(1200, 1200);
    
    expect(highBeatsLow.winnerChange).toBeLessThan(equalMatch.winnerChange);
  });

  it('should give larger gain when lower-rated player wins (upset)', () => {
    const lowBeatsHigh = calculateEloChange(1200, 1400);
    const equalMatch = calculateEloChange(1200, 1200);
    
    expect(lowBeatsHigh.winnerChange).toBeGreaterThan(equalMatch.winnerChange);
  });

  it('should handle large ELO differences', () => {
    const { winnerChange, loserChange } = calculateEloChange(1800, 1200);
    
    // High-rated player wins - minimal gain
    expect(winnerChange).toBeLessThan(10);
    expect(loserChange).toBeGreaterThan(-10);
  });

  it('should give big swing on major upset', () => {
    const { winnerChange, loserChange } = calculateEloChange(1200, 1800);
    
    // Low-rated player wins - big gain
    expect(winnerChange).toBeGreaterThan(25);
    expect(loserChange).toBeLessThan(-25);
  });
});

describe('DEFAULT_ELO', () => {
  it('should be 1200', () => {
    expect(DEFAULT_ELO).toBe(1200);
  });
});
