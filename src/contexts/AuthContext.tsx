import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api, type ApiPlayer } from "../api/client";

interface AuthContextType {
  player: ApiPlayer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<ApiPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const me = await api.getMe();
          setPlayer(me);
        } catch (error) {
          console.error("Token invalid, clearing:", error);
          api.setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, player } = await api.login({ email, password });
    api.setToken(token);
    setPlayer(player);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { token, player } = await api.register({ email, password, displayName });
    api.setToken(token);
    setPlayer(player);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setPlayer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ player, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
