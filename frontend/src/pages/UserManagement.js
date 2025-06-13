import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/lightDarkTheme';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const UserManagement = () => {
  // Theme context
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for add user dialog
  const [addDialog, setAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    fullname: '',
    password: '',
    role: 'user'
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  
  // State for edit user dialog
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // State for search user
  const [searchUser, setSearchUser] = useState('');
  
  // Role options
  const roleOptions = ['owner', 'admin', 'staff', 'user'];
  
  // Cek role user dari localStorage
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  
  // Jika role owner, izinkan akses tampilan user management, tapi tanpa add/edit/delete
  const canAccess = userRole === 'admin' || userRole === 'owner' || userRole === 'staff';
  // Untuk owner, tidak boleh add/edit/delete
  const canAdd = userRole === 'admin';

  // Fetch users on component mount
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'owner' || userRole === 'staff') {
      fetchUsers();
    }
  }, [userRole]);
  
  // Function to fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change for new user form
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle input change for edit user form
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open edit dialog and set selected user
  const handleEditOpen = (user) => {
    setSelectedUser({
      ...user,
      password: '' // Don't include password in edit form
    });
    setEditDialog(true);
  };
  
  // Open delete confirmation dialog
  const handleDeleteOpen = (userId) => {
    setDeleteUserId(userId);
    setDeleteDialog(true);
  };
  
  // Add new user
  const handleAddUser = async () => {
    setAddLoading(true);
    setAddError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddDialog(false);
      setNewUser({
        username: '',
        fullname: '',
        password: '',
        role: 'user'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setAddError(error.response?.data?.message || 'Failed to add user');
    } finally {
      setAddLoading(false);
    }
  };
  
  // Update existing user
  const handleUpdateUser = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        fullname: selectedUser.fullname,
        role: selectedUser.role
      };
      
      // Only include password if it was changed
      if (selectedUser.password) {
        updateData.password = selectedUser.password;
      }
      
      await axios.put(`${API_URL}/api/users/${selectedUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setEditError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Box sx={{ minHeight: '100vh', width: '100%', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif', color: theme.text.primary, backgroundImage: "url('/Frame211332.png')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundColor: theme.background.default, overflowX: 'hidden' }}>
      {/* Overlay gradient agar teks tetap jelas */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: theme.gradients.overlay, pointerEvents: 'none' }} />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.text.primary, fontWeight: 800, letterSpacing: 1 }}>User Management</Typography>
      {!canAccess ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          User role {userRole} is not authorized to access this route
        </Alert>
      ) : (
        <>
          {canAdd && (
            <Button
              variant="contained"
              sx={{
                mb: 2,
                background: theme.gradients.button,
                color: theme.primary.contrastText,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: theme.shadows.button,
                '&:hover': { background: theme.gradients.buttonHover }
              }}
              onClick={() => setAddDialog(true)}
            >
              Add User
            </Button>
          )}
          {/* Search user input for admin, staff, owner */}
          {(userRole === 'admin' || userRole === 'staff' || userRole === 'owner') && (
            <TextField
              placeholder="Cari User"
              variant="outlined"
              size="small"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              InputProps={{
                style: {
                  color: theme.text.primary,
                  background: theme.background.hover,
                  borderRadius: 12,
                  border: `1.5px solid ${theme.border.main}`,
                  boxShadow: theme.shadows.input
                },
                startAdornment: (
                  <Box component="span" sx={{ color: theme.text.secondary, mr: 1, fontSize: 14, display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 4 }}>🔍</span>
                  </Box>
                )
              }}
              InputLabelProps={{ style: { color: theme.text.secondary, fontWeight: 600 } }}
              sx={{
                mb: 2,
                ml: { xs: 0, sm: 2 },
                width: '320px',
                input: { color: theme.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border.main },
                '& input::placeholder': { color: theme.text.hint, opacity: 1 },
                borderRadius: 2,
              }}
            />
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{
              background: theme.background.card,
              borderRadius: 3,
              boxShadow: theme.shadows.card,
              border: `1.5px solid ${theme.border.dark}`,
              backdropFilter: 'blur(8px)',
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: theme.background.hover }}>
                    {(userRole === 'admin' || userRole === 'staff') && <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>User ID</TableCell>}
                    <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>Username</TableCell>
                    <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>Full Name</TableCell>
                    <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>Role</TableCell>
                    <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>Date Created</TableCell>
                    {canAdd && <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(user => {
                    const search = searchUser.toLowerCase();
                    return user.username.toLowerCase().includes(search) ||
                           user.fullname.toLowerCase().includes(search) ||
                           user._id.toLowerCase().includes(search);
                  }).map(user => (
                    <TableRow key={user._id}>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{user._id.substring(0, 8)}</TableCell>
                      )}
                      <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{user.username}</TableCell>
                      <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{user.fullname}</TableCell>
                      <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{user.role}</TableCell>
                      <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{formatDate(user.createdAt)}</TableCell>
                      {canAdd && (
                        <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>
                          <IconButton onClick={() => handleEditOpen(user)} sx={{ color: theme.text.primary }}><EditIcon sx={{ color: theme.text.primary }} /></IconButton>
                          <IconButton onClick={() => handleDeleteOpen(user._id)} sx={{ color: theme.text.primary }}><DeleteIcon sx={{ color: theme.text.primary }} /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Dialog tambah user hanya untuk admin */}
      {canAdd && (
        <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth
  PaperProps={{
    sx: {
      background: theme.background.card,
      color: theme.text.primary,
      borderRadius: 3,
      boxShadow: theme.shadows.card,
      border: `1.5px solid ${theme.border.main}`,
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>
          <DialogTitle sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 22, pb: 2, fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
            Add New User
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              value={newUser.username}
              onChange={handleNewUserChange}
              InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
              InputProps={{
                style: {
                  color: '#fff',
                  background: 'rgba(65,227,255,0.15)',
                  borderRadius: 8,
                  border: '1.5px solid #41e3ff',
                  fontFamily: 'Open Sans',
                  fontWeight: 600,
                },
                sx: {
                  '& input': { color: '#fff' },
                  '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
                }
              }}
              sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
            />
            <TextField
              margin="dense"
              name="fullname"
              label="Full Name"
              type="text"
              fullWidth
              value={newUser.fullname}
              onChange={handleNewUserChange}
              InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
              InputProps={{
                style: {
                  color: '#fff',
                  background: 'rgba(65,227,255,0.15)',
                  borderRadius: 8,
                  border: '1.5px solid #41e3ff',
                  fontFamily: 'Open Sans',
                  fontWeight: 600,
                },
                sx: {
                  '& input': { color: '#fff' },
                  '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
                }
              }}
              sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={handleNewUserChange}
              InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
              InputProps={{
                style: {
                  color: '#fff',
                  background: 'rgba(65,227,255,0.15)',
                  borderRadius: 8,
                  border: '1.5px solid #41e3ff',
                  fontFamily: 'Open Sans',
                  fontWeight: 600,
                },
                sx: {
                  '& input': { color: '#fff' },
                  '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
                }
              }}
              sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
            />
            <FormControl fullWidth sx={{ mb: 2, bgcolor: '#162336', borderRadius: 2 }}>
              <InputLabel sx={{ color: '#b5eaff', fontWeight: 600 }}>Role</InputLabel>
              <Select
                name="role"
                value={newUser.role}
                label="Role"
                onChange={handleNewUserChange}
                sx={{
                  color: '#fff',
                  background: '#162336',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontFamily: 'Open Sans',
                  '& .MuiSelect-select': {
                    color: '#fff',
                    background: '#162336',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontFamily: 'Open Sans',
                  },
                  '& fieldset': {
                    borderColor: '#41e3ff',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: '#162336',
                      color: '#fff',
                      borderRadius: 2,
                    },
                  },
                }}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setAddDialog(false)}
              variant="outlined"
              sx={{ 
                color: '#41e3ff', 
                borderColor: '#41e3ff',
                '&:hover': { borderColor: '#41e3ff', background: 'rgba(65,227,255,0.08)' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              variant="contained"
              disabled={addLoading || !newUser.username || !newUser.fullname || !newUser.password}
              sx={{
                ml: 2,
                background: 'linear-gradient(90deg, #41e3ff 0%, #1ec6e6 100%)',
                color: '#0a1929',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(65,227,255,0.12)',
                '&:hover': { background: '#65e7ff' },
                '&.Mui-disabled': { background: 'rgba(65,227,255,0.3)', color: '#193549' }
              }}
            >
              {addLoading ? <CircularProgress size={22} color="inherit" /> : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Dialog edit user hanya untuk admin */}
      {canAdd && (
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth
  PaperProps={{
    sx: {
      background: theme.background.card,
      color: theme.text.primary,
      borderRadius: 3,
      boxShadow: theme.shadows.card,
      border: `1.5px solid ${theme.border.main}`,
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>
          <DialogTitle sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 22, pb: 2, fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
            Edit User
          </DialogTitle>
          <DialogContent>
            <TextField
  margin="dense"
  name="username"
  label="Username"
  type="text"
  fullWidth
  value={selectedUser?.username || ''}
  disabled
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: 'rgba(65,227,255,0.15)',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
    },
    sx: {
      '& input': { color: '#fff' },
      '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
    }
  }}
  sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
/>
            <TextField
  margin="dense"
  name="fullname"
  label="Full Name"
  type="text"
  fullWidth
  value={selectedUser?.fullname || ''}
  onChange={handleEditUserChange}
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: 'rgba(65,227,255,0.15)',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
    },
    sx: {
      '& input': { color: '#fff' },
      '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
    }
  }}
  sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
/>
            <TextField
  margin="dense"
  name="password"
  label="New Password (leave blank to keep current)"
  type="password"
  fullWidth
  value={selectedUser?.password || ''}
  onChange={handleEditUserChange}
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: 'rgba(65,227,255,0.15)',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
    },
    sx: {
      '& input': { color: '#fff' },
      '& input::placeholder': { color: '#bdbdbd', opacity: 1 },
    }
  }}
  sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
/>
            <FormControl fullWidth sx={{ mb: 2, bgcolor: '#162336', borderRadius: 2 }}>
              <InputLabel sx={{ color: '#b5eaff', fontWeight: 600 }}>Role</InputLabel>
              <Select
                name="role"
                value={selectedUser?.role || ''}
                label="Role"
                onChange={handleEditUserChange}
                sx={{
                  color: '#fff',
                  background: '#162336',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontFamily: 'Open Sans',
                  '& .MuiSelect-select': {
                    color: '#fff',
                    background: '#162336',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontFamily: 'Open Sans',
                  },
                  '& fieldset': {
                    borderColor: '#41e3ff',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: '#162336',
                      color: '#fff',
                      borderRadius: 2,
                    },
                  },
                }}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setEditDialog(false)}
              variant="outlined"
              sx={{ 
                color: '#41e3ff', 
                borderColor: '#41e3ff',
                '&:hover': { borderColor: '#41e3ff', background: 'rgba(65,227,255,0.08)' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              disabled={editLoading || !selectedUser?.fullname}
              sx={{
                ml: 2,
                background: 'linear-gradient(90deg, #41e3ff 0%, #1ec6e6 100%)',
                color: '#0a1929',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(65,227,255,0.12)',
                '&:hover': { background: '#65e7ff' },
                '&.Mui-disabled': { background: 'rgba(65,227,255,0.3)', color: '#193549' }
              }}
            >
              {editLoading ? <CircularProgress size={22} color="inherit" /> : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {canAdd && (
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteUser}
              variant="contained"
              color="error"
              disabled={deleteLoading}
            >
              {deleteLoading ? <CircularProgress size={22} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
    </Box>
  );
};

export default UserManagement;
