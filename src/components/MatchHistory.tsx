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
import type { Match, PendingMatch } from "../types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type HistoryItem = 
  | { type: "confirmed"; data: Match }
  | { type: "pending"; data: PendingMatch };

export default function MatchHistory() {
  const { matches, pendingMatches, loading } = useData();

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Combine and sort by date (most recent first)
  const allItems: HistoryItem[] = [
    ...pendingMatches.map((p) => ({ type: "pending" as const, data: p })),
    ...matches.map((m) => ({ type: "confirmed" as const, data: m })),
  ].sort((a, b) => {
    const dateA = a.data.playedAt || a.data.createdAt;
    const dateB = b.data.playedAt || b.data.createdAt;
    return dateB - dateA;
  });

  if (allItems.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.secondary">
          No matches recorded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Match History
      </Typography>
      <List disablePadding>
        {allItems.map((item) => {
          const isPending = item.type === "pending";
          const match = item.data;

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
                <Avatar src={match.winnerPhotoURL} alt={match.winnerName} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold">
                      {match.winnerName}
                    </Typography>
                    <Typography color="text.secondary">vs</Typography>
                    <Typography>{match.loserName}</Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                    <Chip
                      label={match.scoreDetails || `${match.winnerScore} - ${match.loserScore}`}
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
                          label={`+${(match as Match).winnerEloChange}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={`${(match as Match).loserEloChange}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(match.playedAt || match.createdAt)}
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
