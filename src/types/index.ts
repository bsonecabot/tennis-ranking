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
  scoreDetails?: string; // e.g., "6-4, 7-5" or "6-3, 4-6, 6-2"
  playedAt?: number; // when the match was played
  winnerEloChange: number;
  loserEloChange: number;
  createdAt: number;
  recordedBy: string;
}

export interface PendingMatch {
  id: string;
  winnerId: string;
  winnerName: string;
  winnerPhotoURL: string;
  loserId: string;
  loserName: string;
  loserPhotoURL: string;
  winnerScore: number;
  loserScore: number;
  scoreDetails?: string;
  playedAt: number; // when the match was played
  createdAt: number; // when it was submitted
  recordedBy: string;
  status: "pending" | "approved" | "rejected";
}
