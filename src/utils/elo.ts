const K_FACTOR = 32;
const DEFAULT_ELO = 1200;

export function calculateEloChange(
  winnerElo: number,
  loserElo: number
): { winnerChange: number; loserChange: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  const winnerChange = Math.round(K_FACTOR * (1 - expectedWinner));
  const loserChange = Math.round(K_FACTOR * (0 - expectedLoser));

  return { winnerChange, loserChange };
}

export { DEFAULT_ELO };
