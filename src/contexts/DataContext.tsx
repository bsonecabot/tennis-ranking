import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  runTransaction,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { calculateEloChange } from "../utils/elo";
import type { Player, Match, PendingMatch, FriendRequest, Friendship } from "../types";
import { useAuth } from "./AuthContext";

interface DataContextType {
  players: Player[];
  matches: Match[];
  pendingMatches: PendingMatch[];
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  friends: Player[];
  submitMatch: (
    winner: Player,
    loser: Player,
    winnerScore: number,
    loserScore: number,
    recordedBy: string,
    scoreDetails?: string,
    playedAt?: number
  ) => Promise<void>;
  approveMatch: (pendingMatch: PendingMatch) => Promise<void>;
  rejectMatch: (pendingMatchId: string) => Promise<void>;
  sendFriendRequest: (toPlayer: Player) => Promise<void>;
  acceptFriendRequest: (request: FriendRequest) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  isFriend: (uid: string) => boolean;
  loading: boolean;
}

const DataContext = createContext<DataContextType>(null!);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { player: currentPlayer } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute friends list from friendships
  const friendUids = friendships.flatMap((f) =>
    f.user1Uid === currentPlayer?.uid ? [f.user2Uid] : [f.user1Uid]
  );
  const friends = players.filter((p) => friendUids.includes(p.uid));

  const isFriend = useCallback(
    (uid: string) => friendUids.includes(uid),
    [friendUids]
  );

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      orderBy("elo", "desc")
    );
    const unsubPlayers = onSnapshot(playersQuery, (snapshot) => {
      const playerList = snapshot.docs.map((doc) => doc.data() as Player);
      setPlayers(playerList);
      setLoading(false);
    });

    const matchesQuery = query(
      collection(db, "matches"),
      orderBy("createdAt", "desc")
    );
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const matchList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Match[];
      setMatches(matchList);
    });

    const pendingQuery = query(
      collection(db, "pendingMatches"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      const pendingList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingMatch[];
      setPendingMatches(pendingList);
    });

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubPending();
    };
  }, []);

  // Subscribe to friend requests (where I'm the recipient)
  useEffect(() => {
    if (!currentPlayer) return;

    const requestsQuery = query(
      collection(db, "friendRequests"),
      where("toUid", "==", currentPlayer.uid),
      where("status", "==", "pending")
    );
    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FriendRequest[];
      setFriendRequests(requestList);
    });

    return () => unsubRequests();
  }, [currentPlayer]);

  // Subscribe to friendships (where I'm either user)
  useEffect(() => {
    if (!currentPlayer) return;

    const friendshipsQuery = query(
      collection(db, "friendships"),
      where("users", "array-contains", currentPlayer.uid)
    );
    const unsubFriendships = onSnapshot(friendshipsQuery, (snapshot) => {
      const friendshipList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Friendship[];
      setFriendships(friendshipList);
    });

    return () => unsubFriendships();
  }, [currentPlayer]);

  // Submit a match for approval (goes to pending)
  const submitMatch = useCallback(
    async (
      winner: Player,
      loser: Player,
      winnerScore: number,
      loserScore: number,
      recordedBy: string,
      scoreDetails?: string,
      playedAt?: number
    ) => {
      const pendingData: Omit<PendingMatch, "id"> = {
        winnerId: winner.uid,
        winnerName: winner.displayName,
        winnerPhotoURL: winner.photoURL,
        loserId: loser.uid,
        loserName: loser.displayName,
        loserPhotoURL: loser.photoURL,
        winnerScore,
        loserScore,
        playedAt: playedAt || Date.now(),
        createdAt: Date.now(),
        recordedBy,
        status: "pending",
      };

      if (scoreDetails) {
        pendingData.scoreDetails = scoreDetails;
      }

      await addDoc(collection(db, "pendingMatches"), pendingData);
    },
    []
  );

  // Approve a pending match - update ELO and create confirmed match
  const approveMatch = useCallback(
    async (pendingMatch: PendingMatch) => {
      const winner = players.find((p) => p.uid === pendingMatch.winnerId);
      const loser = players.find((p) => p.uid === pendingMatch.loserId);

      if (!winner || !loser) {
        throw new Error("Players not found");
      }

      const { winnerChange, loserChange } = calculateEloChange(
        winner.elo,
        loser.elo
      );

      await runTransaction(db, async (transaction) => {
        const winnerRef = doc(db, "players", winner.uid);
        const loserRef = doc(db, "players", loser.uid);

        transaction.update(winnerRef, {
          elo: winner.elo + winnerChange,
          wins: winner.wins + 1,
          matchesPlayed: winner.matchesPlayed + 1,
        });

        transaction.update(loserRef, {
          elo: loser.elo + loserChange,
          losses: loser.losses + 1,
          matchesPlayed: loser.matchesPlayed + 1,
        });
      });

      // Create confirmed match
      const matchData: Omit<Match, "id"> = {
        winnerId: pendingMatch.winnerId,
        winnerName: pendingMatch.winnerName,
        winnerPhotoURL: pendingMatch.winnerPhotoURL,
        loserId: pendingMatch.loserId,
        loserName: pendingMatch.loserName,
        loserPhotoURL: pendingMatch.loserPhotoURL,
        winnerScore: pendingMatch.winnerScore,
        loserScore: pendingMatch.loserScore,
        playedAt: pendingMatch.playedAt,
        winnerEloChange: winnerChange,
        loserEloChange: loserChange,
        createdAt: pendingMatch.createdAt,
        recordedBy: pendingMatch.recordedBy,
      };

      if (pendingMatch.scoreDetails) {
        matchData.scoreDetails = pendingMatch.scoreDetails;
      }

      await addDoc(collection(db, "matches"), matchData);

      // Delete pending match
      await deleteDoc(doc(db, "pendingMatches", pendingMatch.id));
    },
    [players]
  );

  // Reject a pending match
  const rejectMatch = useCallback(async (pendingMatchId: string) => {
    await deleteDoc(doc(db, "pendingMatches", pendingMatchId));
  }, []);

  // Send a friend request
  const sendFriendRequest = useCallback(
    async (toPlayer: Player) => {
      if (!currentPlayer) throw new Error("Not logged in");

      const requestData: Omit<FriendRequest, "id"> = {
        fromUid: currentPlayer.uid,
        fromName: currentPlayer.displayName,
        fromPhotoURL: currentPlayer.photoURL,
        toUid: toPlayer.uid,
        toName: toPlayer.displayName,
        toPhotoURL: toPlayer.photoURL,
        status: "pending",
        createdAt: Date.now(),
      };

      await addDoc(collection(db, "friendRequests"), requestData);
    },
    [currentPlayer]
  );

  // Accept a friend request
  const acceptFriendRequest = useCallback(
    async (request: FriendRequest) => {
      if (!currentPlayer) throw new Error("Not logged in");

      // Create friendship (sort UIDs for consistent querying)
      const sortedUids = [request.fromUid, request.toUid].sort() as [string, string];
      const friendshipData: Omit<Friendship, "id"> = {
        users: sortedUids,
        user1Uid: request.fromUid,
        user1Name: request.fromName,
        user1PhotoURL: request.fromPhotoURL,
        user2Uid: request.toUid,
        user2Name: request.toName,
        user2PhotoURL: request.toPhotoURL,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, "friendships"), friendshipData);

      // Delete the request
      await deleteDoc(doc(db, "friendRequests", request.id));
    },
    [currentPlayer]
  );

  // Reject a friend request
  const rejectFriendRequest = useCallback(async (requestId: string) => {
    await deleteDoc(doc(db, "friendRequests", requestId));
  }, []);

  return (
    <DataContext.Provider
      value={{
        players,
        matches,
        pendingMatches,
        friendRequests,
        friendships,
        friends,
        submitMatch,
        approveMatch,
        rejectMatch,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        isFriend,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
