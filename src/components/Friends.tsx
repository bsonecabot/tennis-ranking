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
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { ApiPlayer } from "../api/client";

export default function Friends() {
  const { player: currentPlayer } = useAuth();
  const {
    friends,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchPlayers,
    isFriend,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiPlayer[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    setError("");
    try {
      const results = await searchPlayers(searchQuery);
      // Filter out current player and existing friends
      const filtered = results.filter(
        (p) => p.id !== currentPlayer?.id && !isFriend(p.id)
      );
      setSearchResults(filtered);
    } catch {
      setError("Erro ao buscar jogadores");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (player: ApiPlayer) => {
    setSending(player.id);
    setError("");
    setSuccess("");
    try {
      await sendFriendRequest(player.id);
      setSuccess(`Solicitação enviada para ${player.displayName}!`);
      setSearchResults(searchResults.filter((p) => p.id !== player.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação");
    } finally {
      setSending(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    setProcessing(requestId);
    setError("");
    try {
      await acceptFriendRequest(requestId);
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
        <Box display="flex" gap={1} mb={2}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            label="Buscar por nome ou email"
            size="small"
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || searchQuery.length < 2}
            startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            Buscar
          </Button>
        </Box>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <List disablePadding>
            {searchResults.map((player) => (
              <ListItem
                key={player.id}
                sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSendRequest(player)}
                    disabled={sending === player.id}
                  >
                    {sending === player.id ? "Enviando..." : "Adicionar"}
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={player.photoURL || undefined} />
                </ListItemAvatar>
                <ListItemText
                  primary={player.displayName}
                  secondary={`${player.elo} ELO`}
                />
              </ListItem>
            ))}
          </List>
        )}
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
                      onClick={() => handleAccept(request.id)}
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
                  <Avatar src={request.requester?.photoURL || undefined} />
                </ListItemAvatar>
                <ListItemText
                  primary={request.requester?.displayName || "Unknown"}
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
            Você ainda não tem amigos. Busque jogadores acima!
          </Typography>
        ) : (
          <List disablePadding>
            {friends.map((friend) => (
              <ListItem key={friend.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar src={friend.photoURL || undefined} />
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
