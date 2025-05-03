import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState(null);
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

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
      background: 'linear-gradient(120deg, #f7f7fa 0%, #e2e6f3 100%)',
      display: 'flex',
      flexDirection: 'row',
      fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
    }}>
      {/* SIDEBAR */}
      <Box sx={{
        width: { xs: 64, md: 90, lg: 100 },
        background: '#fff',
        borderRadius: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        m: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        gap: 2,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 2, color: '#222' }}>IntiDocs</Typography>
        </Box>
        {/* Navigation Icons */}
        {menuItems.map((item) => (
          <IconButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              color: location.pathname === item.path ? '#3b82f6' : '#b0b3c6',
              background: location.pathname === item.path ? '#e7f0fe' : 'transparent',
              mb: 2,
              borderRadius: '16px',
              p: 1.5
            }}
          >
            {item.icon}
          </IconButton>
        ))}
        {/* Activity Log khusus admin/owner */}
        {['admin', 'owner'].includes(user?.role) && (
          <IconButton
            onClick={() => navigate('/activity-log')}
            sx={{
              color: location.pathname === '/activity-log' ? '#3b82f6' : '#b0b3c6',
              background: location.pathname === '/activity-log' ? '#e7f0fe' : 'transparent',
              mt: 2,
              borderRadius: '16px',
              p: 1.5
            }}
          >
            <HistoryIcon />
          </IconButton>
        )}
        {/* Logout */}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleLogout}
          sx={{ color: '#b0b3c6', background: 'transparent', mb: 1, borderRadius: '16px', p: 1.5 }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', pl: { xs: 1, md: 4 }, pr: { xs: 1, md: 4 }, pt: 3 }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#21243d', letterSpacing: 1 }}>
            Document Management System
          </Typography>
          {/* User Info */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', px: 3, py: 1, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Avatar sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 600 }}>
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '1rem' }}>{user.fullname || user.username}</Typography>
                <Typography sx={{ color: '#7a7a8c', fontSize: '0.9rem' }}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Typography>
              </Box>
            </Box>
          )}
        </Box>
        {/* MAIN CONTENT (children) */}
        <Box sx={{ flex: 1, width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
