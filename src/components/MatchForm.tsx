import { useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Alert,
  Paper,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { isValidTennisSet } from "../utils/tennis";
import type { Player } from "../types";

interface SetScore {
  me: string;
  opponent: string;
}

export default function MatchForm() {
  const { player: currentPlayer } = useAuth();
  const { players, submitMatch } = useData();

  const [opponent, setOpponent] = useState<Player | null>(null);
  const [matchDate, setMatchDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sets, setSets] = useState<SetScore[]>([{ me: "", opponent: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter out current player from opponent options
  const opponentOptions = players.filter(
    (p) => p.uid !== currentPlayer?.uid
  );

  const addSet = () => {
    setSets([...sets, { me: "", opponent: "" }]);
  };

  const removeSet = () => {
    if (sets.length > 1) {
      setSets(sets.slice(0, -1));
    }
  };

  const updateSet = (
    index: number,
    player: "me" | "opponent",
    value: string
  ) => {
    const newSets = [...sets];
    newSets[index][player] = value;
    setSets(newSets);
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPlayer) {
      setError("You must be logged in.");
      return;
    }

    if (!opponent) {
      setError("Select an opponent.");
      return;
    }

    if (!matchDate) {
      setError("Select a match date.");
      return;
    }

    // Count sets won by each player
    let mySets = 0;
    let opponentSets = 0;
    const validSets: { me: number; opp: number }[] = [];

    for (const set of sets) {
      const me = parseInt(set.me, 10);
      const opp = parseInt(set.opponent, 10);

      // Skip empty sets
      if (set.me === "" && set.opponent === "") continue;

      if (isNaN(me) || isNaN(opp) || me < 0 || opp < 0) {
        setError("Set scores must be valid non-negative numbers.");
        return;
      }

      // Validate tennis set scoring
      if (!isValidTennisSet(me, opp)) {
        setError(
          `Invalid set score: ${me}-${opp}. Tennis sets are won 6-0 to 6-4, 7-5, 7-6, etc.`
        );
        return;
      }

      validSets.push({ me, opp });

      if (me > opp) mySets++;
      else opponentSets++;
    }

    if (validSets.length < 1) {
      setError("Enter at least 1 set.");
      return;
    }

    if (mySets === opponentSets) {
      setError("Match must have a winner (can't be a tie in sets).");
      return;
    }

    // Determine winner and loser
    const iWon = mySets > opponentSets;
    const winner = iWon ? currentPlayer : opponent;
    const loser = iWon ? opponent : currentPlayer;
    const winnerSets = Math.max(mySets, opponentSets);
    const loserSets = Math.min(mySets, opponentSets);

    // Format score string (from winner's perspective)
    const scoreStr = validSets
      .map((s) => (iWon ? `${s.me}-${s.opp}` : `${s.opp}-${s.me}`))
      .join(", ");

    // Parse match date
    const playedAt = new Date(matchDate).getTime();

    try {
      setSubmitting(true);
      await submitMatch(
        winner,
        loser,
        winnerSets,
        loserSets,
        currentPlayer.uid,
        scoreStr,
        playedAt
      );
      setSuccess(
        `Match submitted for approval! ${opponent.displayName} needs to confirm.`
      );
      setOpponent(null);
      setSets([{ me: "", opponent: "" }]);
      setMatchDate(new Date().toISOString().split("T")[0]);
    } catch {
      setError("Failed to record match. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentPlayer) return null;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Log Match
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={validateAndSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {/* Current player (fixed) */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              You
            </Typography>
            <Chip
              avatar={<Avatar src={currentPlayer.photoURL} />}
              label={`${currentPlayer.displayName} (${currentPlayer.elo})`}
              sx={{ mt: 0.5 }}
            />
          </Box>

          {/* Opponent selector */}
          <Autocomplete
            options={opponentOptions}
            getOptionLabel={(p) => `${p.displayName} (${p.elo})`}
            value={opponent}
            onChange={(_, val) => setOpponent(val)}
            renderInput={(params) => (
              <TextField {...params} label="Opponent" required />
            )}
            isOptionEqualToValue={(opt, val) => opt.uid === val.uid}
          />

          {/* Match date */}
          <TextField
            type="date"
            label="Match Date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Sets header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight="medium">
              Sets
            </Typography>
            <Box>
              <IconButton
                onClick={removeSet}
                disabled={sets.length <= 1}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <IconButton onClick={addSet} size="small">
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Set scores */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {sets.map((set, index) => (
              <Box key={index} display="flex" alignItems="center" gap={0.5}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 50 }}
                >
                  Set {index + 1}:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={set.me}
                  onChange={(e) => updateSet(index, "me", e.target.value)}
                  sx={{ width: 60 }}
                  inputProps={{ min: 0, max: 9 }}
                  placeholder="You"
                />
                <Typography>-</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={set.opponent}
                  onChange={(e) => updateSet(index, "opponent", e.target.value)}
                  sx={{ width: 60 }}
                  inputProps={{ min: 0, max: 9 }}
                  placeholder={opponent?.displayName?.split(" ")[0] || "Opp"}
                />
              </Box>
            ))}
          </Box>

          <Typography variant="caption" color="text.secondary">
            Sets: 6-4, 7-5, 7-6 (tiebreak) | Pro-set: 8-6, 9-7, 9-8 (tiebreak)
          </Typography>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Match"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
