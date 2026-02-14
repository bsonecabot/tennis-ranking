import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Skeleton,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import type { ApiMatch } from "../api/client";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MatchHistory() {
  const { matches, loading } = useData();
  const { player: currentPlayer } = useAuth();

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Sort by date (most recent first)
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedMatches.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.secondary">
          No matches recorded yet.
        </Typography>
      </Box>
    );
  }

  const getMatchInfo = (match: ApiMatch) => {
    const winner = match.winner || (match.winnerId === match.player1Id ? match.player1 : match.player2);
    const loser = match.winnerId === match.player1Id ? match.player2 : match.player1;
    const isMyMatch = match.player1Id === currentPlayer?.id || match.player2Id === currentPlayer?.id;
    const iWon = match.winnerId === currentPlayer?.id;
    
    // Get ELO changes for winner/loser
    const winnerEloChange = match.winnerId === match.player1Id ? match.player1EloChange : match.player2EloChange;
    const loserEloChange = match.winnerId === match.player1Id ? match.player2EloChange : match.player1EloChange;
    
    return { winner, loser, isMyMatch, iWon, winnerEloChange, loserEloChange };
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Match History
      </Typography>
      <List disablePadding>
        {sortedMatches.map((match) => {
          const isPending = match.status === "pending";
          const isRejected = match.status === "rejected";
          const { winner, loser, winnerEloChange, loserEloChange } = getMatchInfo(match);

          if (isRejected) return null;

          return (
            <ListItem
              key={match.id}
              sx={{
                mb: 1,
                borderRadius: 1,
                bgcolor: "background.paper",
                flexWrap: "wrap",
                opacity: isPending ? 0.7 : 1,
                borderLeft: isPending ? "3px solid orange" : "none",
              }}
            >
              <ListItemAvatar>
                <Avatar src={winner?.photoURL || undefined} alt={winner?.displayName} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold">
                      {winner?.displayName || "Unknown"}
                    </Typography>
                    <Typography color="text.secondary">vs</Typography>
                    <Typography>{loser?.displayName || "Unknown"}</Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                    <Chip
                      label={match.score}
                      size="small"
                      color={isPending ? "default" : "primary"}
                    />
                    {isPending ? (
                      <Chip
                        icon={<HourglassEmptyIcon />}
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <>
                        <Chip
                          label={`+${winnerEloChange}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={`${loserEloChange}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </>
                    )}
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
    </Box>
  );
}
