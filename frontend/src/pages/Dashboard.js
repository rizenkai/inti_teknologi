import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  // NEW: State for Add Document Dialog
  const [addDialog, setAddDialog] = useState(false);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  
  // Nuevos estados para los campos adicionales
  const [newDocBP, setNewDocBP] = useState('');
  const [newDocKodeBahan, setNewDocKodeBahan] = useState('');
  const [newDocTipeBahan, setNewDocTipeBahan] = useState('');
  // Check user role (from localStorage)
  let userRole = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user?.role || '';
  } catch {}

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newBP, setNewBP] = useState('');
  const [newKodeBahan, setNewKodeBahan] = useState('');
  const [newTipeBahan, setNewTipeBahan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusOptions = [
    'in_progress',
    'review',
    'completed',
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Avoid duplicate fetching by debouncing
  const fetchDocumentsDebounced = useCallback(
    debounce(() => {
      fetchDocuments();
    }, 300),
    []
  );

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
        // Add cache buster to avoid browser caching
        params: { _t: new Date().getTime() }
      });
      
      // Ensure we don't have duplicates by using document ID as unique key
      const uniqueDocs = {};
      (response.data.documents || []).forEach(doc => {
        uniqueDocs[doc._id] = doc;
      });
      setDocuments(Object.values(uniqueDocs));
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
    // Inicializar los campos adicionales con los valores actuales del documento
    setNewBP(document.bp !== null && document.bp !== undefined ? document.bp.toString() : '');
    setNewKodeBahan(document.kodeBahan || '');
    setNewTipeBahan(document.tipeBahan || '');
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
      fetchDocumentsDebounced();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const handleDelete = (document) => {
    setSelectedDocument(document);
    setDeleteDialog(true);
  };

  // Handle document download
  const handleDownloadDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Show loading indicator
      setLoading(true);
      
      // Make API request to download the document
      const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get document from state to use filename
      const document = documents.find(doc => doc._id === documentId);
      a.download = document?.fileName || 'document';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document: ' + (error.response?.data?.message || 'Unknown error'));
      
      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/documents/${selectedDocument._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteDialog(false);
      fetchDocumentsDebounced();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDocumentUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Preparar datos para la actualización
      const updateData = {
        status: newStatus
      };
      
      // Agregar campos adicionales solo si el usuario es admin o staff
      if (userRole === 'admin' || userRole === 'staff') {
        // Convertir BP a número o null si está vacío
        updateData.bp = newBP ? parseFloat(newBP) : null;
        updateData.kodeBahan = newKodeBahan;
        updateData.tipeBahan = newTipeBahan;
      }
      
      await axios.put(
        `http://localhost:5000/api/documents/${selectedDocument._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditDialog(false);
      fetchDocumentsDebounced();
    } catch (error) {
      console.error('Error updating document:', error);
      setError(error.response?.data?.message || 'Failed to update document');
    } finally {
      setLoading(false);
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
              <TableCell>BP (Kg)</TableCell>
              <TableCell>Kode Bahan</TableCell>
              <TableCell>Tipe Bahan</TableCell>
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
                <TableCell>{doc.bp !== null && doc.bp !== undefined ? doc.bp : '-'}</TableCell>
                <TableCell>{doc.kodeBahan || '-'}</TableCell>
                <TableCell>{doc.tipeBahan || '-'}</TableCell>
                <TableCell>{formatDate(doc.submissionDate)}</TableCell>
                <TableCell>{formatDate(doc.lastModified)}</TableCell>
                <TableCell>
                  {userRole === 'user' || userRole === 'owner' ? (
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleDownloadDocument(doc._id)}
                    >
                      Download
                    </Button>
                  ) : (
                    <>
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
                        onClick={() => handleDelete(doc)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Material
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Campo BP (Kg) */}
                  <TextField
                    margin="dense"
                    label="BP (Kg)"
                    type="number"
                    inputProps={{ step: 'any' }} // Permite valores decimales
                    value={newBP}
                    onChange={e => setNewBP(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                  />
                  
                  {/* Campo Kode Bahan */}
                  <TextField
                    margin="dense"
                    label="Kode Bahan"
                    type="text"
                    value={newKodeBahan}
                    onChange={e => setNewKodeBahan(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                  />
                  
                  {/* Campo Tipe Bahan (dropdown) */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}>
                    <InputLabel>Tipe Bahan</InputLabel>
                    <Select
                      value={newTipeBahan}
                      label="Tipe Bahan"
                      onChange={e => setNewTipeBahan(e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Silinder">Silinder</MenuItem>
                      <MenuItem value="Kubus">Kubus</MenuItem>
                      <MenuItem value="Balok">Balok</MenuItem>
                      <MenuItem value="Paving">Paving</MenuItem>
                      <MenuItem value="Scoup">Scoup</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleDocumentUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Add Document Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tambah Dokumen Baru</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Judul Dokumen"
              type="text"
              fullWidth
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              required
            />
            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Material
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Campo BP (Kg) */}
                  <TextField
                    margin="dense"
                    label="BP (Kg)"
                    type="number"
                    inputProps={{ step: 'any' }} // Permite valores decimales
                    value={newDocBP}
                    onChange={e => setNewDocBP(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                  />
                  
                  {/* Campo Kode Bahan */}
                  <TextField
                    margin="dense"
                    label="Kode Bahan"
                    type="text"
                    value={newDocKodeBahan}
                    onChange={e => setNewDocKodeBahan(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                  />
                  
                  {/* Campo Tipe Bahan (dropdown) */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}>
                    <InputLabel>Tipe Bahan</InputLabel>
                    <Select
                      value={newDocTipeBahan}
                      label="Tipe Bahan"
                      onChange={e => setNewDocTipeBahan(e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Silinder">Silinder</MenuItem>
                      <MenuItem value="Kubus">Kubus</MenuItem>
                      <MenuItem value="Balok">Balok</MenuItem>
                      <MenuItem value="Paving">Paving</MenuItem>
                      <MenuItem value="Scoup">Scoup</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
            
            {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Batal</Button>
          <Button
            onClick={async () => {
              setAddLoading(true);
              setAddError('');
              try {
                const token = localStorage.getItem('token');
                
                // Preparar datos del documento incluyendo los campos adicionales
                const documentData = {
                  title: newDocTitle
                };
                
                // Agregar campos adicionales solo si el usuario es admin o staff
                if (userRole === 'admin' || userRole === 'staff') {
                  // Convertir BP a número o null si está vacío
                  documentData.bp = newDocBP ? parseFloat(newDocBP) : null;
                  documentData.kodeBahan = newDocKodeBahan;
                  documentData.tipeBahan = newDocTipeBahan;
                }
                
                await axios.post('http://localhost:5000/api/documents/manual', documentData, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setAddDialog(false);
                // Resetear todos los campos
                setNewDocTitle('');
                setNewDocBP('');
                setNewDocKodeBahan('');
                setNewDocTipeBahan('');
                fetchDocumentsDebounced();
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete document "{selectedDocument?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
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

export default Dashboard;
