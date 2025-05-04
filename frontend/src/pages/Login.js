import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaRegEyeSlash } from 'react-icons/fa';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
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
      
      if (!formData.username || !formData.password) {
        setError('Please enter both username and password');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: formData.username.trim(),
        password: formData.password
      });

      const { data } = response;
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        // Simpan data user lengkap termasuk fullname
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          username: data.username,
          fullname: data.fullname,
          role: data.role,
        }));
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden',
      fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('/Frame211332.png')",
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundColor: '#090d1f',
      position: 'relative',
    }}>
      {/* Overlay gradient agar teks tetap jelas */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: 'radial-gradient(ellipse at 60% 40%, rgba(65,227,255,0.18) 0%, rgba(59,130,246,0.16) 40%, rgba(9,13,31,0.8) 100%)',
        pointerEvents: 'none',
      }} />
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(20, 32, 54, 0.72)',
          boxShadow: 'none',
          borderRadius: '14px',
          p: { xs: 3, md: 5 },
          mx: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(59,130,246,0.23)',
        }}
      >
        <Button
          onClick={() => navigate('/')}
          sx={{
            minWidth: 0,
            p: 0,
            mb: 2,
            alignSelf: 'flex-start',
            color: '#b5eaff',
            background: 'none',
            textTransform: 'none',
            fontSize: 24,
            fontWeight: 700,
            '&:hover': { background: 'none', color: '#41e3ff' },
          }}
          aria-label="Kembali ke Landing"
        >
          <span style={{fontSize: 26, marginRight: 8, display: 'inline-block', verticalAlign: 'middle'}}>&larr;</span>
        </Button>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, color: '#fff', mb: 1, fontFamily: 'Open Sans', alignSelf: 'flex-start', ml: 0 }}>
          Masuk ke IntiDocs
        </Typography>
        <Typography sx={{ color: '#b5eaff', mb: 3, fontWeight: 200, fontSize: '0.95rem', fontFamily: 'Open Sans', alignSelf: 'flex-start', ml: 0 }}>
          Silakan login untuk mengakses dashboard dan dokumen.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, fontFamily: 'Open Sans' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label=""
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            InputProps={{
              sx: {
                bgcolor: '#232b3e',
                color: '#fff',
                borderRadius: '8px',
                fontFamily: 'Open Sans',
                fontWeight: 600,
                border: '1.5px solid #3b82f6',
                '& input': {
                  color: '#fff',
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #232b3e inset',
                  WebkitTextFillColor: '#fff',
                  color: '#fff',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              placeholder: 'Username',
            }}
            InputLabelProps={{ shrink: false }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label=""
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              sx: {
                bgcolor: '#232b3e',
                color: '#fff',
                borderRadius: '8px',
                fontFamily: 'Open Sans',
                fontWeight: 600,
                border: '1.5px solid #3b82f6',
                '& input': {
                  color: '#fff',
                },
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #232b3e inset',
                  WebkitTextFillColor: '#fff',
                  color: '#fff',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              placeholder: 'Password',
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    sx={{ color: '#b5eaff' }}
                  >
                    {showPassword ? <FaRegEyeSlash size={20} /> : <FaEye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ shrink: false }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
              color: '#090d1f',
              fontWeight: 600,
              fontFamily: 'Open Sans',
              fontSize: '1.1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(65,227,255,0.13)',
              textTransform: 'none',
              letterSpacing: 0.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
                color: '#fff',
              },
            }}
          >
            Masuk
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
