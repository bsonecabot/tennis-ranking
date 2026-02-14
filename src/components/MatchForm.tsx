import { useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { Player } from "../types";

export default function MatchForm() {
  const { player: currentPlayer } = useAuth();
  const { players, recordMatch } = useData();

  const [winner, setWinner] = useState<Player | null>(null);
  const [loser, setLoser] = useState<Player | null>(null);
  const [winnerScore, setWinnerScore] = useState("");
  const [loserScore, setLoserScore] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!winner || !loser) {
      setError("Select both a winner and a loser.");
      return;
    }
    if (winner.uid === loser.uid) {
      setError("Winner and loser must be different players.");
      return;
    }

    const wScore = parseInt(winnerScore, 10);
    const lScore = parseInt(loserScore, 10);
    if (isNaN(wScore) || isNaN(lScore) || wScore < 0 || lScore < 0) {
      setError("Scores must be valid non-negative numbers.");
      return;
    }
    if (wScore <= lScore) {
      setError("Winner's score must be higher than loser's score.");
      return;
    }

    try {
      setSubmitting(true);
      await recordMatch(winner, loser, wScore, lScore, currentPlayer!.uid);
      setSuccess(
        `Match recorded! ${winner.displayName} beat ${loser.displayName} ${wScore}-${lScore}`
      );
      setWinner(null);
      setLoser(null);
      setWinnerScore("");
      setLoserScore("");
    } catch {
      setError("Failed to record match. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Log Match
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Autocomplete
            options={players}
            getOptionLabel={(p) => `${p.displayName} (${p.elo})`}
            value={winner}
            onChange={(_, val) => setWinner(val)}
            renderInput={(params) => (
              <TextField {...params} label="Winner" required />
            )}
            isOptionEqualToValue={(opt, val) => opt.uid === val.uid}
          />

          <Autocomplete
            options={players}
            getOptionLabel={(p) => `${p.displayName} (${p.elo})`}
            value={loser}
            onChange={(_, val) => setLoser(val)}
            renderInput={(params) => (
              <TextField {...params} label="Loser" required />
            )}
            isOptionEqualToValue={(opt, val) => opt.uid === val.uid}
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Winner Score"
              type="number"
              value={winnerScore}
              onChange={(e) => setWinnerScore(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Loser Score"
              type="number"
              value={loserScore}
              onChange={(e) => setLoserScore(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? "Recording..." : "Record Match"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
