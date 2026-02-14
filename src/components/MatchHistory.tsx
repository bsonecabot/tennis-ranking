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
import { useData } from "../contexts/DataContext";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchHistory() {
  const { matches, loading } = useData();

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (matches.length === 0) {
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
        {matches.map((match) => (
          <ListItem
            key={match.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: "background.paper",
              flexWrap: "wrap",
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
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    label={`${match.winnerScore} - ${match.loserScore}`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`+${match.winnerEloChange}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${match.loserEloChange}`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(match.createdAt)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
