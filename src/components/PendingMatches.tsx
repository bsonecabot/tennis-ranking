import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Paper,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useState } from "react";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PendingMatches() {
  const { player: currentPlayer } = useAuth();
  const { pendingMatches, approveMatch, rejectMatch } = useData();
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Filter matches where current user is the opponent (loser) who needs to approve
  const matchesToApprove = pendingMatches.filter(
    (m) => m.loserId === currentPlayer?.uid && m.recordedBy !== currentPlayer?.uid
  );

  // Matches submitted by current user waiting for opponent approval
  const myPendingMatches = pendingMatches.filter(
    (m) => m.recordedBy === currentPlayer?.uid
  );

  const handleApprove = async (match: typeof pendingMatches[0]) => {
    setProcessing(match.id);
    setError("");
    try {
      await approveMatch(match);
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

  if (matchesToApprove.length === 0 && myPendingMatches.length === 0) {
    return null;
  }

  return (
    <Box mb={3}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {matchesToApprove.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "warning.light" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⚠️ Awaiting Your Confirmation
          </Typography>
          <List disablePadding>
            {matchesToApprove.map((match) => (
              <ListItem
                key={match.id}
                sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <Box>
                    <IconButton
                      color="success"
                      onClick={() => handleApprove(match)}
                      disabled={processing === match.id}
                      title="Confirm result"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleReject(match.id)}
                      disabled={processing === match.id}
                      title="Reject result"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>
                        <strong>{match.winnerName}</strong> claims victory over you
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={match.scoreDetails || `${match.winnerScore}-${match.loserScore}`}
                        size="small"
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Played: {formatDate(match.playedAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {myPendingMatches.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: "info.light" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⏳ Waiting for Opponent Confirmation
          </Typography>
          <List disablePadding>
            {myPendingMatches.map((match) => (
              <ListItem
                key={match.id}
                sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}
              >
                <ListItemText
                  primary={
                    <Typography>
                      <strong>{match.winnerName}</strong> vs {match.loserName}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={match.scoreDetails || `${match.winnerScore}-${match.loserScore}`}
                        size="small"
                      />
                      <Chip label="Pending" size="small" color="warning" />
                      <Typography variant="caption" color="text.secondary">
                        Played: {formatDate(match.playedAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
