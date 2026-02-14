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
} from "@mui/material";
import {
  Home as HomeIcon,
  Leaderboard as LeaderboardIcon,
  AddCircle as AddCircleIcon,
  History as HistoryIcon,
  SportsTennis as TennisIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "/" },
  { label: "Rankings", icon: <LeaderboardIcon />, path: "/rankings" },
  { label: "Log Match", icon: <AddCircleIcon />, path: "/log-match" },
  { label: "History", icon: <HistoryIcon />, path: "/history" },
];

export default function Layout() {
  const { user, player, loading, signInWithGoogle, logout } = useAuth();
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

  if (!user || !player) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={3}
      >
        <TennisIcon sx={{ fontSize: 80, color: "primary.main" }} />
        <Typography variant="h3" fontWeight="bold">
          Tennis Ranking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track matches and ELO ratings among friends
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={signInWithGoogle}
          sx={{ mt: 2 }}
        >
          Sign in with Google
        </Button>
      </Box>
    );
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
              src={player.photoURL}
              alt={player.displayName}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(`/player/${player.uid}`);
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
