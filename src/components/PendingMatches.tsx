import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
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
import type { ApiMatch } from "../api/client";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PendingMatches() {
  const { player: currentPlayer } = useAuth();
  const { pendingMatches, matches, approveMatch, rejectMatch } = useData();
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Matches waiting for my confirmation (I'm the opponent, not the reporter)
  const matchesToApprove = pendingMatches;

  // Matches I submitted waiting for opponent confirmation
  const myPendingMatches = matches.filter(
    (m) => m.status === "pending" && m.reportedById === currentPlayer?.id
  );

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

  const getMatchDescription = (match: ApiMatch) => {
    const winner = match.winner || (match.winnerId === match.player1Id ? match.player1 : match.player2);
    const loser = match.winnerId === match.player1Id ? match.player2 : match.player1;
    return { winner, loser };
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
            {matchesToApprove.map((match) => {
              const { winner, loser } = getMatchDescription(match);
              const iWon = match.winnerId === currentPlayer?.id;
              
              return (
                <ListItem
                  key={match.id}
                  sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}
                  secondaryAction={
                    <Box>
                      <IconButton
                        color="success"
                        onClick={() => handleApprove(match.id)}
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
                  <ListItemAvatar>
                    <Avatar src={winner?.photoURL || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>
                          {iWon ? (
                            <>You beat <strong>{loser?.displayName}</strong></>
                          ) : (
                            <><strong>{winner?.displayName}</strong> claims victory over you</>
                          )}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip
                          label={match.score}
                          size="small"
                          color="primary"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(match.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {myPendingMatches.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: "info.light" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⏳ Waiting for Opponent Confirmation
          </Typography>
          <List disablePadding>
            {myPendingMatches.map((match) => {
              const { winner, loser } = getMatchDescription(match);
              
              return (
                <ListItem
                  key={match.id}
                  sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar src={winner?.photoURL || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography>
                        <strong>{winner?.displayName}</strong> vs {loser?.displayName}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip label={match.score} size="small" />
                        <Chip label="Pending" size="small" color="warning" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(match.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
}
