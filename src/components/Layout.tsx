import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  TextField,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Home as HomeIcon,
  AddCircle as AddCircleIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  SportsTennis as TennisIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "/" },
  { label: "Friends", icon: <PeopleIcon />, path: "/friends" },
  { label: "Log", icon: <AddCircleIcon />, path: "/log-match" },
  { label: "History", icon: <HistoryIcon />, path: "/history" },
];

function LoginForm() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === 0) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        await register(email, password, displayName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
      p={3}
    >
      <TennisIcon sx={{ fontSize: 80, color: "primary.main" }} />
      <Typography variant="h3" fontWeight="bold">
        Tennis Ranking
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Track matches and ELO ratings among friends
      </Typography>

      <Paper sx={{ p: 3, width: "100%", maxWidth: 400 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          {tab === 1 && (
            <TextField
              label="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              fullWidth
            />
          )}

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : (tab === 0 ? "Login" : "Register")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function Layout() {
  const { player, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currentTab = navItems.findIndex(
    (item) => item.path === location.pathname
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!player) {
    return <LoginForm />;
  }

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="sticky">
        <Toolbar>
          <TennisIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tennis Ranking
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              src={player.photoURL || undefined}
              alt={player.displayName}
              sx={{ width: 32, height: 32 }}
            >
              {player.displayName[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(`/player/${player.id}`);
              }}
            >
              My Profile ({player.elo} ELO)
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
        <Outlet />
      </Box>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          value={currentTab === -1 ? false : currentTab}
          onChange={(_, newValue) => navigate(navItems[newValue].path)}
          showLabels
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
