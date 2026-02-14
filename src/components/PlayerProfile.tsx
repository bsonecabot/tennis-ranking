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
import type { ApiMatch } from "../api/client";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlayerProfile() {
  const { uid } = useParams<{ uid: string }>();
  const { players, matches } = useData();

  const player = players.find((p) => p.id === uid);
  const playerMatches = matches.filter(
    (m) => m.status === "confirmed" && (m.player1Id === uid || m.player2Id === uid)
  );
  const rank = players.findIndex((p) => p.id === uid) + 1;

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

  const getMatchInfo = (match: ApiMatch) => {
    const isWinner = match.winnerId === uid;
    const winner = match.player1Id === match.winnerId ? match.player1 : match.player2;
    const loser = match.player1Id === match.winnerId ? match.player2 : match.player1;
    const opponent = isWinner ? loser : winner;
    const myEloChange = match.player1Id === uid ? match.player1EloChange : match.player2EloChange;
    
    return { isWinner, opponent, myEloChange };
  };

  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: "center", mb: 2 }}>
        <Avatar
          src={player.photoURL || undefined}
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
              const { isWinner, opponent, myEloChange } = getMatchInfo(match);
              
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
                            <strong>{opponent?.displayName || "Unknown"}</strong>
                          </Typography>
                          <Chip
                            label={match.score}
                            size="small"
                          />
                          <Chip
                            label={myEloChange >= 0 ? `+${myEloChange}` : `${myEloChange}`}
                            size="small"
                            color={myEloChange >= 0 ? "success" : "error"}
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
