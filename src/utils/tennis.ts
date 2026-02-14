/**
 * Validates if a score represents a valid tennis set.
 * Valid sets:
 * - 6-0, 6-1, 6-2, 6-3, 6-4 (normal win)
 * - 7-5 (win with 2-game lead after 5-5)
 * - 7-6 (tiebreak)
 */
export function isValidTennisSet(a: number, b: number): boolean {
  // Reject negative scores
  if (a < 0 || b < 0) return false;

  const high = Math.max(a, b);
  const low = Math.min(a, b);

  // Standard set (first to 6)
  // Normal: 6-0, 6-1, 6-2, 6-3, 6-4
  if (high === 6 && low <= 4) return true;
  // Extended: 7-5
  if (high === 7 && low === 5) return true;
  // Tiebreak: 7-6
  if (high === 7 && low === 6) return true;

  // Pro set (first to 8)
  // Normal: 8-0 to 8-6
  if (high === 8 && low <= 6) return true;
  // Extended: 9-7
  if (high === 9 && low === 7) return true;
  // Tiebreak: 9-8
  if (high === 9 && low === 8) return true;

  return false;
}

/**
 * Determines the winner of a match based on sets won.
 * Returns 1 if player 1 wins, 2 if player 2 wins, 0 if tie/invalid.
 */
export function determineMatchWinner(
  sets: Array<{ player1: number; player2: number }>
): 1 | 2 | 0 {
  let player1Sets = 0;
  let player2Sets = 0;

  for (const set of sets) {
    if (set.player1 > set.player2) player1Sets++;
    else if (set.player2 > set.player1) player2Sets++;
  }

  if (player1Sets > player2Sets) return 1;
  if (player2Sets > player1Sets) return 2;
  return 0;
}

/**
 * Formats match score as a string (e.g., "6-4, 7-5").
 */
export function formatMatchScore(
  sets: Array<{ player1: number; player2: number }>,
  winner: 1 | 2
): string {
  return sets
    .filter((s) => s.player1 > 0 || s.player2 > 0)
    .map((s) =>
      winner === 1 ? `${s.player1}-${s.player2}` : `${s.player2}-${s.player1}`
    )
    .join(", ");
}
