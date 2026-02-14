import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { api, type ApiPlayer } from "../api/client";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface AuthContextType {
  player: ApiPlayer | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProviderInner({ children }: { children: ReactNode }) {
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await userInfoResponse.json();

        // Send to our API
        const { token, player } = await api.loginWithGoogle({
          googleId: userInfo.sub,
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
        });

        api.setToken(token);
        setPlayer(player);
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      alert("Google login failed. Please try again.");
    },
  });

  const signInWithGoogle = useCallback(() => {
    googleLogin();
  }, [googleLogin]);

  const logout = useCallback(() => {
    api.setToken(null);
    setPlayer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ player, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  );
}
