import { useNavigate } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
  Skeleton,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { useData } from "../contexts/DataContext";

const rankColors: Record<number, string> = {
  0: "#FFD700",
  1: "#C0C0C0",
  2: "#CD7F32",
};

export default function Leaderboard() {
  const { players, loading } = useData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (players.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.secondary">
          No players yet. Be the first to log a match!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Leaderboard
      </Typography>
      <List disablePadding>
        {players.map((player, index) => (
          <ListItemButton
            key={player.id}
            onClick={() => navigate(`/player/${player.id}`)}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: "background.paper",
              border: index < 3 ? `2px solid ${rankColors[index]}` : undefined,
            }}
          >
            <Box
              sx={{
                width: 32,
                display: "flex",
                justifyContent: "center",
                mr: 1,
              }}
            >
              {index < 3 ? (
                <TrophyIcon sx={{ color: rankColors[index] }} />
              ) : (
                <Typography fontWeight="bold" color="text.secondary">
                  {index + 1}
                </Typography>
              )}
            </Box>
            <ListItemAvatar>
              <Avatar src={player.photoURL || undefined} alt={player.displayName} />
            </ListItemAvatar>
            <ListItemText
              primary={player.displayName}
              secondary={`${player.wins}W - ${player.losses}L`}
            />
            <Chip label={player.elo} color="primary" variant="outlined" />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
