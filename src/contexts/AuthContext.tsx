import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../config/firebase";
import { DEFAULT_ELO } from "../utils/elo";
import type { Player } from "../types";

interface AuthContextType {
  user: User | null;
  player: Player | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const playerRef = doc(db, "players", firebaseUser.uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
          setPlayer(playerSnap.data() as Player);
        } else {
          const newPlayer: Player = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Anonymous",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || "",
            elo: DEFAULT_ELO,
            wins: 0,
            losses: 0,
            matchesPlayed: 0,
            createdAt: Date.now(),
          };
          await setDoc(playerRef, newPlayer);
          setPlayer(newPlayer);
        }
      } else {
        setPlayer(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, player, loading, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
