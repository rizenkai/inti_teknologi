import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import { FaEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useTheme as useAppTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Warna tema konsisten dengan landing page
  const themeColors = {
    primary: isDarkMode ? '#41e3ff' : '#1976d2',
    background: isDarkMode ? '#090d1f' : '#ffffff',
    cardBg: isDarkMode ? 'rgba(16,24,40,0.5)' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#333333',
    secondaryText: isDarkMode ? '#b5eaff' : '#666666',
    border: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(0,0,0,0.1)',
    buttonBg: isDarkMode ? '#41e3ff' : '#1976d2',
    buttonText: isDarkMode ? '#090d1f' : '#ffffff',
    headerBg: isDarkMode ? 'rgba(9,13,31,0.8)' : 'rgba(255,255,255,0.9)',
    inputBg: isDarkMode ? 'rgba(16,24,40,0.7)' : '#f5f5f5',
  };

  // Redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/intidocs/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Tampilkan informasi debugging
      console.log('Login attempt with:', {
        username: formData.username.trim(),
        passwordLength: formData.password.length,
        apiUrl: API_URL
      });
      
      if (!formData.username || !formData.password) {
        setError('Please enter both username and password');
        return;
      }

      // Tampilkan URL lengkap untuk debugging
      const loginUrl = `${API_URL}/api/auth/login`;
      console.log('Sending request to:', loginUrl);
      
      const response = await axios.post(loginUrl, {
        username: formData.username.trim(),
        password: formData.password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        hasData: !!response.data,
        hasToken: !!(response.data && response.data.token)
      });

      const { data } = response;
      
      if (data && data.token) {
        console.log('Login successful, saving token and user data');
        localStorage.setItem('token', data.token);
        // Simpan data user lengkap termasuk fullname
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          username: data.username,
          fullname: data.fullname,
          role: data.role,
        }));
        navigate('/intidocs/dashboard');
      } else {
        console.error('Invalid response structure:', data);
        setError('Invalid response from server');
      }
      setLoading(false);
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request',
        config: error.config
      });
      setError(error.response?.data?.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
      color: themeColors.text,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: themeColors.background,
      '&::-webkit-scrollbar': {
        width: 6,
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderRadius: 3,
      },
      scrollbarWidth: 'thin',
      scrollbarColor: `${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} transparent`,
    }}>
      {/* Tombol kembali ke beranda */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10 
      }}>
        <Button
          startIcon={<FaArrowLeft />}
          onClick={() => navigate('/')}
          sx={{
            color: themeColors.primary,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
            },
          }}
        >
          Kembali ke Beranda
        </Button>
      </Box>

      {/* Login Content */}
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Paper 
          elevation={isDarkMode ? 0 : 3}
          sx={{
            width: '100%',
            maxWidth: 500,
            backgroundColor: themeColors.cardBg,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            border: isDarkMode ? `1px solid ${themeColors.border}` : 'none',
            backdropFilter: isDarkMode ? 'blur(10px)' : 'none',
          }}
        >
          <Button
            onClick={() => navigate('/')}
            startIcon={<FaArrowLeft />}
            sx={{
              mb: 3,
              color: themeColors.primary,
              textTransform: 'none',
              fontWeight: 600,
              p: 0,
              '&:hover': { 
                background: 'none', 
                color: isDarkMode ? '#1ec6e6' : '#1565c0',
              },
            }}
          >
            Kembali ke Beranda
          </Button>
          
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: themeColors.text, 
            mb: 1,
          }}>
            Masuk ke IntiDocs
          </Typography>
          
          <Typography sx={{ 
            color: themeColors.secondaryText, 
            mb: 4,
            lineHeight: 1.7,
          }}>
            Silakan login untuk mengakses dashboard dan dokumen.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeColors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: themeColors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeColors.primary,
                  },
                  backgroundColor: themeColors.inputBg,
                },
                '& .MuiInputLabel-root': {
                  color: themeColors.secondaryText,
                },
                '& .MuiOutlinedInput-input': {
                  color: themeColors.text,
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeColors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: themeColors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeColors.primary,
                  },
                  backgroundColor: themeColors.inputBg,
                },
                '& .MuiInputLabel-root': {
                  color: themeColors.secondaryText,
                },
                '& .MuiOutlinedInput-input': {
                  color: themeColors.text,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      sx={{ color: themeColors.secondaryText }}
                    >
                      {showPassword ? <FaRegEyeSlash /> : <FaEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: loading ? (isDarkMode ? 'rgba(65,227,255,0.5)' : 'rgba(25,118,210,0.5)') : themeColors.buttonBg,
                color: themeColors.buttonText,
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: loading ? (isDarkMode ? 'rgba(65,227,255,0.5)' : 'rgba(25,118,210,0.5)') : (isDarkMode ? '#1ec6e6' : '#1565c0'),
                },
                position: 'relative',
              }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: isDarkMode ? '#090d1f' : '#ffffff',
                      position: 'absolute',
                      left: 'calc(50% - 12px)',
                    }} 
                  />
                  <span style={{ visibility: 'hidden' }}>Masuk</span>
                </>
              ) : 'Masuk'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
