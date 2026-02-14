// Re-export API types for backwards compatibility
export type { ApiPlayer as Player, ApiMatch as Match, ApiFriendRequest as FriendRequest, ApiFriendship as Friendship } from '../api/client';

// Legacy types for components that haven't been updated yet
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
  playedAt: number;
  createdAt: number;
  recordedBy: string;
  status: "pending" | "approved" | "rejected";
}
