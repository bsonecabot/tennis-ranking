import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import Leaderboard from "./components/Leaderboard";
import MatchForm from "./components/MatchForm";
import MatchHistory from "./components/MatchHistory";
import PlayerProfile from "./components/PlayerProfile";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2e7d32" },
    secondary: { main: "#ff9800" },
    background: { default: "#f5f5f5" },
  },
  shape: { borderRadius: 12 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Leaderboard />} />
                <Route path="/log-match" element={<MatchForm />} />
                <Route path="/history" element={<MatchHistory />} />
                <Route path="/player/:uid" element={<PlayerProfile />} />
              </Route>
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
