import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { ApiMatch } from "../api/client";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const { player: currentPlayer } = useAuth();
  const { matches, pendingMatches, approveMatch, rejectMatch, loading } = useData();
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!currentPlayer) return null;

  // Matches needing my approval (from pendingMatches endpoint)
  const needsMyApproval = pendingMatches;

  // Matches I submitted, waiting for opponent
  const waitingForOpponent = matches.filter(
    (m) => m.status === "pending" && m.reportedById === currentPlayer.id
  );

  // My confirmed matches
  const myConfirmedMatches = matches
    .filter((m) => m.status === "confirmed")
    .slice(0, 10);

  const handleApprove = async (matchId: string) => {
    setProcessing(matchId);
    setError("");
    try {
      await approveMatch(matchId);
    } catch {
      setError("Failed to approve match");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (matchId: string) => {
    setProcessing(matchId);
    setError("");
    try {
      await rejectMatch(matchId);
    } catch {
      setError("Failed to reject match");
    } finally {
      setProcessing(null);
    }
  };

  const getMatchInfo = (match: ApiMatch) => {
    const winner = match.winner || (match.winnerId === match.player1Id ? match.player1 : match.player2);
    const loser = match.winnerId === match.player1Id ? match.player2 : match.player1;
    const iWon = match.winnerId === currentPlayer?.id;
    
    const myEloChange = match.player1Id === currentPlayer?.id 
      ? match.player1EloChange 
      : match.player2EloChange;
    
    return { winner, loser, iWon, myEloChange };
  };

  const renderMatchCard = (
    match: ApiMatch,
    isPending: boolean,
    needsAction: boolean
  ) => {
    const { winner, loser, iWon, myEloChange } = getMatchInfo(match);
    const opponent = iWon ? loser : winner;

    return (
      <Paper
        key={match.id}
        sx={{
          p: 2,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderLeft: isPending ? "4px solid orange" : iWon ? "4px solid #4caf50" : "4px solid #f44336",
        }}
      >
        {/* Avatars */}
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={currentPlayer.photoURL || undefined} sx={{ width: 48, height: 48 }} />
          <Typography color="text.secondary" fontWeight="bold">vs</Typography>
          <Avatar src={opponent?.photoURL || undefined} sx={{ width: 48, height: 48 }} />
        </Box>

        {/* Match info */}
        <Box flex={1}>
          <Typography fontWeight="bold">
            {iWon ? "🏆 " : ""}vs {opponent?.displayName || "Unknown"}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
            <Chip
              label={match.score}
              size="small"
              color={isPending ? "default" : "primary"}
            />
            {isPending && (
              <Chip
                icon={<HourglassEmptyIcon />}
                label="Pending"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            {!isPending && (
              <Chip
                label={myEloChange >= 0 ? `+${myEloChange}` : `${myEloChange}`}
                size="small"
                color={myEloChange >= 0 ? "success" : "error"}
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDate(match.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        {needsAction && (
          <Box>
            <IconButton
              color="success"
              onClick={() => handleApprove(match.id)}
              disabled={processing === match.id}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleReject(match.id)}
              disabled={processing === match.id}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Needs my approval */}
      {needsMyApproval.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" color="warning.main" gutterBottom>
            ⚠️ Confirm Results ({needsMyApproval.length})
          </Typography>
          {needsMyApproval.map((m) => renderMatchCard(m, true, true))}
        </Box>
      )}

      {/* Waiting for opponent */}
      {waitingForOpponent.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" color="info.main" gutterBottom>
            ⏳ Waiting for Opponent ({waitingForOpponent.length})
          </Typography>
          {waitingForOpponent.map((m) => renderMatchCard(m, true, false))}
        </Box>
      )}

      {/* My recent matches */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        My Matches
      </Typography>
      {myConfirmedMatches.length === 0 ? (
        <Typography color="text.secondary">No matches yet. Log your first match!</Typography>
      ) : (
        myConfirmedMatches.map((m) => renderMatchCard(m, false, false))
      )}
    </Box>
  );
}
