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
  signInWithRedirect,
  getRedirectResult,
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

  // Handle redirect result on page load
  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // Ignore redirect errors on fresh page load
    });
  }, []);

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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      // If popup fails (blocked or storage issues), fallback to redirect
      const err = error as { code?: string };
      if (
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/internal-error"
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
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
