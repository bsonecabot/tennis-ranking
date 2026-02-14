import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api, type ApiPlayer, type ApiMatch, type ApiFriendRequest } from "../api/client";
import { useAuth } from "./AuthContext";

interface DataContextType {
  players: ApiPlayer[];
  matches: ApiMatch[];
  pendingMatches: ApiMatch[];
  friendRequests: ApiFriendRequest[];
  friends: ApiPlayer[];
  loading: boolean;
  refresh: () => Promise<void>;
  submitMatch: (
    opponentId: string,
    winnerId: string,
    score: string
  ) => Promise<void>;
  approveMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  sendFriendRequest: (addresseeId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchPlayers: (query: string) => Promise<ApiPlayer[]>;
  isFriend: (playerId: string) => boolean;
}

const DataContext = createContext<DataContextType>(null!);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { player: currentPlayer } = useAuth();
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [pendingMatches, setPendingMatches] = useState<ApiMatch[]>([]);
  const [friendRequests, setFriendRequests] = useState<ApiFriendRequest[]>([]);
  const [friends, setFriends] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!currentPlayer) {
      setPlayers([]);
      setMatches([]);
      setPendingMatches([]);
      setFriendRequests([]);
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      const [
        playersData,
        matchesData,
        pendingData,
        friendsData,
        requestsData,
      ] = await Promise.all([
        api.getPlayers(),
        api.getMatches(),
        api.getPendingMatches(),
        api.getFriends(),
        api.getFriendRequests(),
      ]);

      setPlayers(playersData);
      setMatches(matchesData);
      setPendingMatches(pendingData);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPlayer]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFriend = useCallback(
    (playerId: string) => friends.some((f) => f.id === playerId),
    [friends]
  );

  const submitMatch = useCallback(
    async (opponentId: string, winnerId: string, score: string) => {
      await api.createMatch({ opponentId, winnerId, score });
      await refresh();
    },
    [refresh]
  );

  const approveMatch = useCallback(
    async (matchId: string) => {
      await api.respondToMatch(matchId, "confirmed");
      await refresh();
    },
    [refresh]
  );

  const rejectMatch = useCallback(
    async (matchId: string) => {
      await api.respondToMatch(matchId, "rejected");
      await refresh();
    },
    [refresh]
  );

  const sendFriendRequest = useCallback(
    async (addresseeId: string) => {
      await api.sendFriendRequest(addresseeId);
      await refresh();
    },
    [refresh]
  );

  const acceptFriendRequest = useCallback(
    async (requestId: string) => {
      await api.respondToFriendRequest(requestId, "accepted");
      await refresh();
    },
    [refresh]
  );

  const rejectFriendRequest = useCallback(
    async (requestId: string) => {
      await api.respondToFriendRequest(requestId, "rejected");
      await refresh();
    },
    [refresh]
  );

  const removeFriend = useCallback(
    async (friendId: string) => {
      await api.removeFriend(friendId);
      await refresh();
    },
    [refresh]
  );

  const searchPlayers = useCallback(async (query: string) => {
    return api.searchPlayers(query);
  }, []);

  return (
    <DataContext.Provider
      value={{
        players,
        matches,
        pendingMatches,
        friendRequests,
        friends,
        loading,
        refresh,
        submitMatch,
        approveMatch,
        rejectMatch,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        searchPlayers,
        isFriend,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
