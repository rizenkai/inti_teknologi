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
} from '@mui/icons-material';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
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
    }}>

      {/* Sidebar */}
      <Box sx={{
        width: sidebarOpen ? { xs: '80vw', md: 220 } : 0,
        maxWidth: { xs: 320, md: 220 },
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: '#111a2b',
        px: sidebarOpen ? { xs: 1, md: 2 } : 0,
        py: sidebarOpen ? { xs: 2, md: 3 } : 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: sidebarOpen ? '2px 0 12px 0 rgba(0,0,0,0.13)' : 'none',
        overflow: sidebarOpen ? 'visible' : 'hidden',
        transition: 'width 0.3s cubic-bezier(.4,2,.6,1), padding 0.3s',
        pointerEvents: sidebarOpen ? 'auto' : 'none',
        visibility: sidebarOpen ? 'visible' : 'hidden',
      }}>
        {/* Logo */}
        <Typography variant="h6" sx={{ color: '#b5eaff', fontWeight: 700, mb: 4, letterSpacing: 1, textAlign: 'center', fontSize: { xs: 18, md: 22 }, display: { xs: sidebarOpen ? 'block' : 'none', md: 'block' } }}>IntiDocs</Typography>
        {/* Menu */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? '#41e3ff' : '#b5eaff',
                fontWeight: 600,
                fontSize: { xs: 14, md: 16 },
                justifyContent: { xs: 'flex-start', md: 'flex-start' },
                px: { xs: 1.5, md: 1 },
                py: 1.2,
                borderRadius: 2,
                background: location.pathname === item.path ? 'rgba(65,227,255,0.10)' : 'transparent',
                minWidth: 0,
                transition: 'background 0.2s',
                mb: 0.5
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
      {/* Main Area */}
      <Box sx={{
        flex: 1,
        minHeight: '100vh',
        pl: { xs: 0, md: sidebarOpen ? '220px' : 0 },
        width: '100%',
        overflowX: 'hidden',
        transition: 'padding-left 0.3s cubic-bezier(.4,2,.6,1)',
      }}>
        {/* Header */}
        <Box sx={{
          position: 'fixed',
          left: { xs: 0, md: sidebarOpen ? 220 : 0 },
          top: 0,
          height: '64px',
          width: { xs: '100%', md: sidebarOpen ? 'calc(100% - 220px)' : '100%' },
          bgcolor: '#101828',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          zIndex: 1100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'left 0.3s cubic-bezier(.4,2,.6,1), width 0.3s cubic-bezier(.4,2,.6,1)',
        }}>
          <IconButton
            onClick={() => setSidebarOpen((open) => !open)}
            sx={{ color: '#41e3ff', display: { xs: 'inline-flex', md: 'inline-flex' }, mr: 2 }}
            size="large"
            aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: 16, md: 22 } }}>Document Management System</Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={(e) => setAnchorElProfile(e.currentTarget)}>
              <Avatar sx={{ bgcolor: '#41e3ff', color: '#090d1f', fontWeight: 700, width: 36, height: 36 }}>
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
              </Avatar>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#b5eaff', lineHeight: 1 }}>{user.fullname || user.username}</Typography>
                <Typography sx={{ fontSize: 12, color: '#41e3ff', fontWeight: 500 }}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Typography>
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
            PaperProps={{ sx: { p: 2, minWidth: 220, bgcolor: '#101828', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.20)' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: '#41e3ff', color: '#090d1f', fontWeight: 700, width: 40, height: 40 }}>
                {user && (user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U'))}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#b5eaff' }}>{user && (user.fullname || user.username)}</Typography>
                <Typography sx={{ fontSize: 13, color: '#41e3ff', fontWeight: 500 }}>{user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: 13, color: '#b5eaff', mb: 1 }}>
              Akun dibuat: {user && user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
            </Typography>
            <Divider sx={{ my: 1, borderColor: '#22304d' }} />
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
        <Box sx={{ pt: '64px', px: { xs: 1, md: 4 }, minHeight: '100vh', bgcolor: 'transparent', width: '100%', overflowX: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
