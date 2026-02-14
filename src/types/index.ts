export interface Player {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  elo: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  createdAt: number;
}

export interface Match {
  id: string;
  winnerId: string;
  winnerName: string;
  winnerPhotoURL: string;
  loserId: string;
  loserName: string;
  loserPhotoURL: string;
  winnerScore: number;
  loserScore: number;
  winnerEloChange: number;
  loserEloChange: number;
  createdAt: number;
  recordedBy: string;
}
