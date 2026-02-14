import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Paper,
  Alert,
  Chip,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { Player } from "../types";

export default function Friends() {
  const { player: currentPlayer } = useAuth();
  const {
    players,
    friends,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isFriend,
  } = useData();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Players that can be added (not self, not already friends)
  const availablePlayers = players.filter(
    (p) => p.uid !== currentPlayer?.uid && !isFriend(p.uid)
  );

  const handleSendRequest = async () => {
    if (!selectedPlayer) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await sendFriendRequest(selectedPlayer);
      setSuccess(`Solicitação enviada para ${selectedPlayer.displayName}!`);
      setSelectedPlayer(null);
    } catch {
      setError("Erro ao enviar solicitação");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (request: typeof friendRequests[0]) => {
    setProcessing(request.id);
    setError("");
    try {
      await acceptFriendRequest(request);
    } catch {
      setError("Erro ao aceitar solicitação");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    setError("");
    try {
      await rejectFriendRequest(requestId);
    } catch {
      setError("Erro ao rejeitar solicitação");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Amigos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Add Friend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          <PersonAddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Adicionar Amigo
        </Typography>
        <Box display="flex" gap={1}>
          <Autocomplete
            options={availablePlayers}
            getOptionLabel={(p) => p.displayName}
            value={selectedPlayer}
            onChange={(_, val) => setSelectedPlayer(val)}
            renderInput={(params) => (
              <TextField {...params} label="Buscar jogador" size="small" />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Avatar src={option.photoURL} sx={{ width: 24, height: 24, mr: 1 }} />
                {option.displayName}
              </li>
            )}
            sx={{ flex: 1 }}
            isOptionEqualToValue={(opt, val) => opt.uid === val.uid}
          />
          <Button
            variant="contained"
            onClick={handleSendRequest}
            disabled={!selectedPlayer || sending}
          >
            Adicionar
          </Button>
        </Box>
      </Paper>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "warning.light" }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Solicitações Pendentes ({friendRequests.length})
          </Typography>
          <List disablePadding>
            {friendRequests.map((request) => (
              <ListItem
                key={request.id}
                sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <Box>
                    <IconButton
                      color="success"
                      onClick={() => handleAccept(request)}
                      disabled={processing === request.id}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleReject(request.id)}
                      disabled={processing === request.id}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar src={request.fromPhotoURL} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.fromName}
                  secondary="quer ser seu amigo"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Friends List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Meus Amigos ({friends.length})
        </Typography>
        {friends.length === 0 ? (
          <Typography color="text.secondary">
            Você ainda não tem amigos. Adicione jogadores acima!
          </Typography>
        ) : (
          <List disablePadding>
            {friends.map((friend) => (
              <ListItem key={friend.uid} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar src={friend.photoURL} />
                </ListItemAvatar>
                <ListItemText
                  primary={friend.displayName}
                  secondary={
                    <Box display="flex" gap={1}>
                      <Chip label={`${friend.elo} ELO`} size="small" />
                      <Chip
                        label={`${friend.wins}W - ${friend.losses}L`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
