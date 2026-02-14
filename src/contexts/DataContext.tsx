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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { calculateEloChange } from "../utils/elo";
import type { Player, Match } from "../types";

interface DataContextType {
  players: Player[];
  matches: Match[];
  recordMatch: (
    winner: Player,
    loser: Player,
    winnerScore: number,
    loserScore: number,
    recordedBy: string
  ) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType>(null!);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

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

    return () => {
      unsubPlayers();
      unsubMatches();
    };
  }, []);

  const recordMatch = useCallback(
    async (
      winner: Player,
      loser: Player,
      winnerScore: number,
      loserScore: number,
      recordedBy: string
    ) => {
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

      await addDoc(collection(db, "matches"), {
        winnerId: winner.uid,
        winnerName: winner.displayName,
        winnerPhotoURL: winner.photoURL,
        loserId: loser.uid,
        loserName: loser.displayName,
        loserPhotoURL: loser.photoURL,
        winnerScore,
        loserScore,
        winnerEloChange: winnerChange,
        loserEloChange: loserChange,
        createdAt: Date.now(),
        recordedBy,
      } satisfies Omit<Match, "id">);
    },
    []
  );

  return (
    <DataContext.Provider value={{ players, matches, recordMatch, loading }}>
      {children}
    </DataContext.Provider>
  );
}
