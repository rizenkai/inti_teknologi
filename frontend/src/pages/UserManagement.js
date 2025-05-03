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
      await axios.post('http://localhost:5000/api/users', newUser, {
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      {!canAccess ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          User role {userRole} is not authorized to access this route
        </Alert>
      ) : (
        <>
          {canAdd && (
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() => setAddDialog(true)}
            >
              Add User
            </Button>
          )}
          {/* Search user input for admin, staff, owner */}
          {(userRole === 'admin' || userRole === 'staff' || userRole === 'owner') && (
            <TextField
              label="Search user by username or fullname"
              variant="outlined"
              size="small"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              sx={{ mb: 2, ml: { xs: 0, sm: 2 }, width: '320px' }}
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {(userRole === 'admin' || userRole === 'staff') && <TableCell>User ID</TableCell>}
                    <TableCell>Username</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Date Created</TableCell>
                    {canAdd && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(user =>
                    user.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                    user.fullname.toLowerCase().includes(searchUser.toLowerCase())
                  ).map(user => (
                    <TableRow key={user._id}>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <TableCell>{user._id.substring(0, 8)}</TableCell>
                      )}
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      {canAdd && (
                        <TableCell>
                          <IconButton onClick={() => handleEditOpen(user)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteOpen(user._id)}><DeleteIcon /></IconButton>
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
      )}
      
      {/* Dialog edit user hanya untuk admin */}
      {canAdd && (
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
  );
};

export default UserManagement;
