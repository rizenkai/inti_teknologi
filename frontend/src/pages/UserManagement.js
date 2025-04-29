import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  
  // Role options
  const roleOptions = ['owner', 'admin', 'staff', 'user'];
  
  // Check if current user is admin
  let userRole = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user?.role || '';
  } catch {}
  
  // Fetch users on component mount
  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);
  
  // Function to fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
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
      await axios.post('http://localhost:5000/api/auth/register', newUser, {
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
      
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, updateData, {
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
      await axios.delete(`http://localhost:5000/api/users/${deleteUserId}`, {
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
  
  // If user is not admin, show access denied
  if (userRole !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You don't have permission to access this page. Only admin users can manage users.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => setAddDialog(true)}
      >
        Add New User
      </Button>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Fullname</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullname}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditOpen(user)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteOpen(user._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add User Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="fullname"
            label="Full Name"
            type="text"
            fullWidth
            value={newUser.fullname}
            onChange={handleNewUserChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={handleNewUserChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={newUser.role}
              label="Role"
              onChange={handleNewUserChange}
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
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={addLoading || !newUser.username || !newUser.fullname || !newUser.password}
          >
            {addLoading ? <CircularProgress size={22} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={selectedUser?.username || ''}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="fullname"
            label="Full Name"
            type="text"
            fullWidth
            value={selectedUser?.fullname || ''}
            onChange={handleEditUserChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            value={selectedUser?.password || ''}
            onChange={handleEditUserChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={selectedUser?.role || ''}
              label="Role"
              onChange={handleEditUserChange}
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
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={editLoading || !selectedUser?.fullname}
          >
            {editLoading ? <CircularProgress size={22} /> : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
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
    </Container>
  );
};

export default UserManagement;
