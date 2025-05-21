import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Popover,
  Divider,
  Switch,
  Tooltip,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Get user data from localStorage if available
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // If not in localStorage, fetch from API
          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Set user data from response
          setUser(response.data);
          // Save to localStorage for future use
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle unauthorized error
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Filtrar elementos del menú según el rol del usuario
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Documents', icon: <DocumentIcon />, path: '/documents' },
    ];
    
    // Añadir opción de Users para admin, staff y owner
    if (user && user.role && (user.role === 'admin' || user.role === 'staff' || user.role === 'owner')) {
      baseItems.push({ text: 'Users', icon: <PeopleIcon />, path: '/users' });
    }

    // Añadir opción de Edit Input hanya untuk admin
    if (user && user.role && user.role === 'admin') {
      baseItems.push({ text: 'Edit Input', icon: <EditIcon />, path: '/edit-input' });
    }
    
    return baseItems;
  };
  
  const menuItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
      width: '100%',
      overflowX: 'clip',
      position: 'relative',
      bgcolor: isDarkMode ? '#090d1f' : '#f8f8f8',
    }}>

      {/* Sidebar */}
      <Box sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '220px',
        bgcolor: isDarkMode ? muiTheme.palette.background.paper : '#f8f8f8',
        color: muiTheme.palette.text.primary,
        zIndex: 1200,
        transform: { xs: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'translateX(0)' },
        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
        boxShadow: '0 0 20px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}>
        {/* Logo */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` 
        }}>
          <Typography variant="h6" sx={{ color: muiTheme.palette.primary.main, fontWeight: 700, fontSize: 22 }}>IntiDocs</Typography>
          <IconButton
            onClick={() => setSidebarOpen(false)}
            sx={{ color: muiTheme.palette.primary.main, display: { xs: 'inline-flex', md: 'none' } }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Menu Items */}
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item, index) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                py: 1.2,
                px: 2,
                mb: 1,
                width: '100%',
                justifyContent: 'flex-start',
                color: location.pathname === item.path ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                bgcolor: location.pathname === item.path ? 
                  (isDarkMode ? 'rgba(65,227,255,0.08)' : 'rgba(33,150,243,0.08)') : 
                  'transparent',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(65,227,255,0.12)' : 'rgba(33,150,243,0.12)',
                },
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
              fullWidth
            >
              <Box sx={{ display: { xs: 'inline', md: 'none' }, ml: 1 }}>{item.text}</Box>
              <Box sx={{ display: { xs: 'none', md: 'inline' }, ml: 1 }}>{item.text}</Box>
            </Button>
          ))}
        </Box>
      </Box>
      {/* Backdrop for mobile sidebar overlay */}
      {sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.28)',
            zIndex: 1199
          }}
        />
      )}
      {/* Main Content */}
      <Box sx={{
        flex: 1,
        minHeight: '100vh',
        pl: { xs: 0, md: sidebarOpen ? '220px' : 0 },
        width: '100%',
        overflowX: 'hidden',
        transition: 'padding-left 0.3s cubic-bezier(.4,2,.6,1)',
        bgcolor: isDarkMode ? '#090d1f' : '#f8f8f8',
      }}>
        {/* Header */}
        <Box sx={{
          position: 'fixed',
          left: { xs: 0, md: sidebarOpen ? 220 : 0 },
          top: 0,
          height: '64px',
          width: { xs: '100%', md: sidebarOpen ? 'calc(100% - 220px)' : '100%' },
          bgcolor: isDarkMode ? muiTheme.palette.background.paper : '#f8f8f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          zIndex: 1100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'left 0.3s cubic-bezier(.4,2,.6,1), width 0.3s cubic-bezier(.4,2,.6,1)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <IconButton
            onClick={() => setSidebarOpen((open) => !open)}
            sx={{ color: muiTheme.palette.primary.main, display: { xs: 'inline-flex', md: 'inline-flex' }, mr: 2 }}
            size="large"
            aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" sx={{ color: muiTheme.palette.text.primary, fontWeight: 700, fontSize: { xs: 16, md: 22 } }}>Document Management System</Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Light/Dark Mode Toggle */}
              <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <DarkModeIcon sx={{ color: isDarkMode ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary, fontSize: 20 }} />
                  <Switch
                    checked={!isDarkMode}
                    onChange={toggleTheme}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: muiTheme.palette.primary.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: muiTheme.palette.primary.main,
                      },
                    }}
                  />
                  <LightModeIcon sx={{ color: !isDarkMode ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary, fontSize: 20 }} />
                </Box>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={(e) => setAnchorElProfile(e.currentTarget)}>
                <Avatar sx={{ bgcolor: muiTheme.palette.primary.main, color: isDarkMode ? '#090d1f' : '#ffffff', fontWeight: 700, width: 36, height: 36 }}>
                  {user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                </Avatar>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: muiTheme.palette.text.secondary, lineHeight: 1 }}>{user.fullname || user.username}</Typography>
                  <Typography sx={{ fontSize: 12, color: muiTheme.palette.primary.main, fontWeight: 500 }}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Popover Profile */}
          <Popover
            open={Boolean(anchorElProfile)}
            anchorEl={anchorElProfile}
            onClose={() => setAnchorElProfile(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ 
              sx: { 
                p: 2, 
                minWidth: 220, 
                bgcolor: muiTheme.palette.background.paper, 
                color: muiTheme.palette.text.primary, 
                boxShadow: '0 4px 24px rgba(0,0,0,0.20)' 
              } 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: muiTheme.palette.primary.main, color: isDarkMode ? '#090d1f' : '#ffffff', fontWeight: 700, width: 40, height: 40 }}>
                {user && (user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U'))}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: muiTheme.palette.text.primary }}>{user && (user.fullname || user.username)}</Typography>
                <Typography sx={{ fontSize: 13, color: muiTheme.palette.primary.main, fontWeight: 500 }}>{user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: 13, color: muiTheme.palette.text.secondary, mb: 1 }}>
              Akun dibuat: {user && user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
            </Typography>
            <Divider sx={{ my: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
            <Button
              variant="contained"
              color="error"
              onClick={() => { setAnchorElProfile(null); handleLogout(); }}
              sx={{ mt: 1, width: '100%', bgcolor: '#d32f2f', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Logout
            </Button>
          </Popover>
        </Box>
        {/* Konten utama */}
        <Box sx={{ 
          position: 'relative',
          pt: '64px', 
          px: { xs: 1, md: 4 }, 
          minHeight: '100vh', 
          bgcolor: isDarkMode ? 'transparent' : '#f8f8f8', 
          width: '100%', 
          overflowX: 'hidden'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
