import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Documents from './pages/Documents';
import ActivityLog from './pages/ActivityLog';
import Landing from './pages/Landing';
import EditInput from './pages/EditInput';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/intidocs/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/intidocs/login" />;
  }
  
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      return children;
    }
  }
  
  // Redirect to dashboard if not admin
  return <Navigate to="/dashboard" />;
};

// Theme Component yang menggunakan context
const ThemeWrapper = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  // Membuat tema berdasarkan mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#41e3ff' : '#2196f3',
      },
      secondary: {
        main: isDarkMode ? '#e74c3c' : '#f44336',
      },
      background: {
        default: isDarkMode ? '#0a1929' : '#f5f5f5',
        paper: isDarkMode ? '#101828' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#333333',
        secondary: isDarkMode ? '#b5eaff' : '#757575',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#101828' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Router>
          <Routes>
          {/* Landing page tetap di root */}
          <Route path="/" element={<Landing />} />
          
          {/* Redirect /intidocs ke /intidocs/login */}
          <Route path="/intidocs" element={<Navigate to="/intidocs/login" />} />
          
          {/* Login dipindahkan ke /intidocs/login */}
          <Route path="/intidocs/login" element={<Login />} />
          
          {/* Redirect old login path to new one */}
          <Route path="/login" element={<Navigate to="/intidocs/login" />} />
          
          {/* Semua rute aplikasi utama dengan prefix /intidocs */}
          <Route
            path="/intidocs/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/intidocs/documents"
            element={
              <PrivateRoute>
                <Layout>
                  <Documents />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/intidocs/users"
            element={
              <PrivateRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/intidocs/activity-log" element={<PrivateRoute><Layout><ActivityLog /></Layout></PrivateRoute>} />
          <Route path="/intidocs/edit-input" 
            element={
              <AdminRoute>
                <Layout>
                  <EditInput />
                </Layout>
              </AdminRoute>
            }
          />
          
          {/* Tidak perlu redirect karena /login adalah rute utama sekarang */}
          </Routes>
        </Router>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;
