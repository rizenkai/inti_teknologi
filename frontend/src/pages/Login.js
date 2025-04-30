import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

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
        navigate('/');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Welcome back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
            >
              SIGN IN
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
