import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState(null);
  const theme = useTheme();
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
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
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
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Document Management System
          </Typography>
          
          {/* User info in top right corner */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mr: 2, 
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  fontSize: '1.1rem'
                }}
              >
                {user.fullname || user.name || user.username}
              </Typography>
              <Avatar 
                sx={{ 
                  bgcolor: '#ffffff', 
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  boxShadow: '0px 0px 8px rgba(255,255,255,0.5)'
                }}
              >
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 
                 user.name ? user.name.charAt(0).toUpperCase() : 
                 user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

export default Layout;
