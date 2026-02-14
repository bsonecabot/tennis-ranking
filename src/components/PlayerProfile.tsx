import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SportsTennis as TennisIcon,
} from "@mui/icons-material";
import { useData } from "../contexts/DataContext";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlayerProfile() {
  const { uid } = useParams<{ uid: string }>();
  const { players, matches } = useData();

  const player = players.find((p) => p.uid === uid);
  const playerMatches = matches.filter(
    (m) => m.winnerId === uid || m.loserId === uid
  );
  const rank = players.findIndex((p) => p.uid === uid) + 1;

  if (!player) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.secondary">
          Player not found.
        </Typography>
      </Box>
    );
  }

  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;

  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center", mb: 2 }}>
        <Avatar
          src={player.photoURL}
          alt={player.displayName}
          sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
        />
        <Typography variant="h5" fontWeight="bold">
          {player.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Joined {formatDate(player.createdAt)}
        </Typography>

        <Box display="flex" justifyContent="center" gap={1} mt={2} flexWrap="wrap">
          <Chip
            icon={<TrophyIcon />}
            label={`Rank #${rank}`}
            color="primary"
          />
          <Chip
            icon={<TrendingUpIcon />}
            label={`${player.elo} ELO`}
            color="secondary"
          />
          <Chip
            icon={<TennisIcon />}
            label={`${player.matchesPlayed} matches`}
            variant="outlined"
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Stats
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2} textAlign="center">
          <Box>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {player.wins}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wins
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {player.losses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Losses
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {winRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Win Rate
            </Typography>
          </Box>
        </Box>
      </Paper>

      {playerMatches.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Matches
          </Typography>
          <List disablePadding>
            {playerMatches.slice(0, 10).map((match, index) => {
              const isWinner = match.winnerId === uid;
              return (
                <Box key={match.id}>
                  {index > 0 && <Divider />}
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {isWinner ? (
                            <TrendingUpIcon fontSize="small" color="success" />
                          ) : (
                            <TrendingDownIcon fontSize="small" color="error" />
                          )}
                          <Typography>
                            {isWinner ? "Beat" : "Lost to"}{" "}
                            <strong>
                              {isWinner ? match.loserName : match.winnerName}
                            </strong>
                          </Typography>
                          <Chip
                            label={`${match.winnerScore}-${match.loserScore}`}
                            size="small"
                          />
                          <Chip
                            label={
                              isWinner
                                ? `+${match.winnerEloChange}`
                                : `${match.loserEloChange}`
                            }
                            size="small"
                            color={isWinner ? "success" : "error"}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={formatDate(match.createdAt)}
                    />
                  </ListItem>
                </Box>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
}
