import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#090d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          background: 'radial-gradient(ellipse at top left, #41e3ff 0%, #3b82f6 40%, #10172a 100%)',
          boxShadow: '0 8px 32px 0 rgba(65,227,255,0.10)',
          borderRadius: '32px',
          p: { xs: 3, md: 5 },
          mx: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 1, fontFamily: 'Open Sans' }}>
          Masuk ke IntiDocs
        </Typography>
        <Typography sx={{ color: '#b5eaff', mb: 3, fontSize: '1.05rem', fontFamily: 'Open Sans' }}>
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
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            InputProps={{
              sx: {
                bgcolor: '#181e2b',
                color: '#fff',
                borderRadius: '12px',
                fontFamily: 'Open Sans',
                fontWeight: 600,
              },
            }}
            InputLabelProps={{ sx: { color: '#b5eaff', fontFamily: 'Open Sans' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              sx: {
                bgcolor: '#181e2b',
                color: '#fff',
                borderRadius: '12px',
                fontFamily: 'Open Sans',
                fontWeight: 600,
              },
            }}
            InputLabelProps={{ sx: { color: '#b5eaff', fontFamily: 'Open Sans' } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
              background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
              color: '#090d1f',
              fontWeight: 900,
              fontFamily: 'Open Sans',
              fontSize: '1.1rem',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(65,227,255,0.13)',
              textTransform: 'none',
              letterSpacing: 0.5,
              '&:hover': {
                bgcolor: '#3b82f6',
                background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
                color: '#fff',
              },
            }}
          >
            MASUK
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
