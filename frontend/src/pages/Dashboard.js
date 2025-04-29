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
} from '@mui/material';
import { format } from 'date-fns';

const Dashboard = () => {
  // NEW: State for Add Document Dialog
  const [addDialog, setAddDialog] = useState(false);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  // Check user role (from localStorage)
  let userRole = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user?.role || '';
  } catch {}

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    'in_progress',
    'review',
    'completed',
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setNewStatus(document.status);
    setEditDialog(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/documents/${selectedDocument._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialog(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Document Management System
      </Typography>
      
      {/* NEW: Add Document Button for Admin */}
      {userRole === 'admin' && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setAddDialog(true)}
        >
          Tambah Dokumen
        </Button>
      )}
      <TextField
        fullWidth
        label="Search documents..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

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
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Document Uploaded</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc._id}>
                <TableCell>{doc._id.substring(0, 3)}</TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.status}</TableCell>
                <TableCell>{formatDate(doc.submissionDate)}</TableCell>
                <TableCell>{formatDate(doc.lastModified)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(doc)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Document Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Add Document Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)}>
        <DialogTitle>Tambah Dokumen Baru</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Judul Dokumen"
            type="text"
            fullWidth
            value={newDocTitle}
            onChange={e => setNewDocTitle(e.target.value)}
          />
          {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Batal</Button>
          <Button
            onClick={async () => {
              setAddLoading(true);
              setAddError('');
              try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:5000/api/documents/manual', {
                  title: newDocTitle
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setAddDialog(false);
                setNewDocTitle('');
                fetchDocuments();
              } catch (err) {
                const errorMsg = err.response?.data?.message || 'Gagal menambah dokumen';
                console.error('Error response:', err.response?.data);
                setAddError(errorMsg);
              } finally {
                setAddLoading(false);
              }
            }}
            variant="contained"
            disabled={addLoading || !newDocTitle}
          >
            {addLoading ? <CircularProgress size={22} /> : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
