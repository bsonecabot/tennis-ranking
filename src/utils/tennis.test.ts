import { describe, it, expect } from 'vitest';
import { isValidTennisSet, isTiebreakSet, determineMatchWinner, formatMatchScore } from './tennis';

describe('isValidTennisSet', () => {
  describe('valid sets', () => {
    it('should accept 6-0 (bagel)', () => {
      expect(isValidTennisSet(6, 0)).toBe(true);
      expect(isValidTennisSet(0, 6)).toBe(true);
    });

    it('should accept 6-1, 6-2, 6-3, 6-4 (normal wins)', () => {
      expect(isValidTennisSet(6, 1)).toBe(true);
      expect(isValidTennisSet(6, 2)).toBe(true);
      expect(isValidTennisSet(6, 3)).toBe(true);
      expect(isValidTennisSet(6, 4)).toBe(true);
    });

    it('should accept 7-5 (extended set)', () => {
      expect(isValidTennisSet(7, 5)).toBe(true);
      expect(isValidTennisSet(5, 7)).toBe(true);
    });

    it('should accept 7-6 (tiebreak)', () => {
      expect(isValidTennisSet(7, 6)).toBe(true);
      expect(isValidTennisSet(6, 7)).toBe(true);
    });

    // Pro set (first to 8)
    it('should accept 8-0 to 8-6 (pro set normal wins)', () => {
      expect(isValidTennisSet(8, 0)).toBe(true);
      expect(isValidTennisSet(8, 3)).toBe(true);
      expect(isValidTennisSet(8, 6)).toBe(true);
      expect(isValidTennisSet(0, 8)).toBe(true);
    });

    it('should accept 9-7 (pro set extended)', () => {
      expect(isValidTennisSet(9, 7)).toBe(true);
      expect(isValidTennisSet(7, 9)).toBe(true);
    });

    it('should accept 9-8 (pro set tiebreak)', () => {
      expect(isValidTennisSet(9, 8)).toBe(true);
      expect(isValidTennisSet(8, 9)).toBe(true);
    });
  });

  describe('invalid sets', () => {
    it('should reject 6-5 (no 2-game lead)', () => {
      expect(isValidTennisSet(6, 5)).toBe(false);
    });

    it('should reject 5-4 (not enough games)', () => {
      expect(isValidTennisSet(5, 4)).toBe(false);
    });

    it('should reject 10-8 (too many games)', () => {
      expect(isValidTennisSet(10, 8)).toBe(false);
    });

    it('should reject 7-4 (invalid score)', () => {
      expect(isValidTennisSet(7, 4)).toBe(false);
    });

    it('should reject 6-6 (no winner)', () => {
      expect(isValidTennisSet(6, 6)).toBe(false);
    });

    it('should reject negative scores', () => {
      expect(isValidTennisSet(-1, 6)).toBe(false);
      expect(isValidTennisSet(6, -1)).toBe(false);
    });

    it('should reject 8-7 (pro set no 2-game lead)', () => {
      expect(isValidTennisSet(8, 7)).toBe(false);
    });

    it('should reject 8-8 (pro set no winner)', () => {
      expect(isValidTennisSet(8, 8)).toBe(false);
    });
  });
});

describe('isTiebreakSet', () => {
  it('should detect 7-6 as tiebreak', () => {
    expect(isTiebreakSet(7, 6)).toBe(true);
    expect(isTiebreakSet(6, 7)).toBe(true);
  });

  it('should detect 9-8 as pro-set tiebreak', () => {
    expect(isTiebreakSet(9, 8)).toBe(true);
    expect(isTiebreakSet(8, 9)).toBe(true);
  });

  it('should return false for non-tiebreak sets', () => {
    expect(isTiebreakSet(6, 4)).toBe(false);
    expect(isTiebreakSet(7, 5)).toBe(false);
    expect(isTiebreakSet(8, 6)).toBe(false);
    expect(isTiebreakSet(9, 7)).toBe(false);
  });
});

describe('determineMatchWinner', () => {
  it('should handle 1-set match', () => {
    const sets = [{ player1: 6, player2: 4 }];
    expect(determineMatchWinner(sets)).toBe(1);
  });

  it('should return 1 when player 1 wins more sets', () => {
    const sets = [
      { player1: 6, player2: 4 },
      { player1: 7, player2: 5 },
    ];
    expect(determineMatchWinner(sets)).toBe(1);
  });

  it('should return 2 when player 2 wins more sets', () => {
    const sets = [
      { player1: 4, player2: 6 },
      { player1: 3, player2: 6 },
    ];
    expect(determineMatchWinner(sets)).toBe(2);
  });

  it('should return 0 on tie', () => {
    const sets = [
      { player1: 6, player2: 4 },
      { player1: 4, player2: 6 },
    ];
    expect(determineMatchWinner(sets)).toBe(0);
  });

  it('should handle 3-set matches correctly', () => {
    const sets = [
      { player1: 6, player2: 3 },
      { player1: 4, player2: 6 },
      { player1: 6, player2: 2 },
    ];
    expect(determineMatchWinner(sets)).toBe(1);
  });
});

describe('formatMatchScore', () => {
  it('should format score from winner perspective (player 1 wins)', () => {
    const sets = [
      { player1: 6, player2: 4 },
      { player1: 7, player2: 5 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('6-4, 7-5');
  });

  it('should format score from winner perspective (player 2 wins)', () => {
    const sets = [
      { player1: 4, player2: 6 },
      { player1: 5, player2: 7 },
    ];
    expect(formatMatchScore(sets, 2)).toBe('6-4, 7-5');
  });

  it('should skip empty sets', () => {
    const sets = [
      { player1: 6, player2: 4 },
      { player1: 7, player2: 5 },
      { player1: 0, player2: 0 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('6-4, 7-5');
  });

  it('should format 3-set match', () => {
    const sets = [
      { player1: 6, player2: 3 },
      { player1: 4, player2: 6 },
      { player1: 6, player2: 2 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('6-3, 4-6, 6-2');
  });

  it('should format tiebreak set as 7-6(x) where x is loser points', () => {
    const sets = [
      { player1: 7, player2: 6, tiebreak: 4 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('7-6(4)');
  });

  it('should format tiebreak when player 2 wins', () => {
    const sets = [
      { player1: 6, player2: 7, tiebreak: 5 },
    ];
    expect(formatMatchScore(sets, 2)).toBe('7-6(5)');
  });

  it('should format pro-set tiebreak as 9-8(x)', () => {
    const sets = [
      { player1: 9, player2: 8, tiebreak: 6 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('9-8(6)');
  });

  it('should handle mixed sets with and without tiebreaks', () => {
    const sets = [
      { player1: 6, player2: 4 },
      { player1: 6, player2: 7, tiebreak: 3 },
      { player1: 6, player2: 2 },
    ];
    expect(formatMatchScore(sets, 1)).toBe('6-4, 6-7(3), 6-2');
  });
});
