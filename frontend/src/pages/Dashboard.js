import React, { useState, useEffect } from 'react';
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
  IconButton,
  Autocomplete
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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
  const [userList, setUserList] = useState([]);
  const [targetUser, setTargetUser] = useState('');

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

  useEffect(() => {
    // Fetch user list only for admin/staff
    if (userRole === 'admin' || userRole === 'staff') {
      const token = localStorage.getItem('token');
      axios.get('http://localhost:5000/api/auth/regular-users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUserList(res.data))
      .catch(() => setUserList([]));
    }
  }, [userRole]);

  const statusOptions = [
    'in_progress',
    'review',
    'completed',
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Avoid duplicate fetching by debouncing
  const fetchDocumentsDebounced = debounce(() => {
    fetchDocuments();
  }, 300);

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
    setTargetUser(document.targetUser?._id || '');
    setEditDialog(true);
  };

  const handleDelete = (document) => {
    setSelectedDocument(document);
    setDeleteDialog(true);
  };

  // Handle document download
  const handleDownloadDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      // Make API request to download the document
      const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important for file downloads
      });
      // Get filename from Content-Disposition header
      let filename = 'document';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = decodeURIComponent(disposition.split('filename=')[1].replace(/['"\s]/g, ''));
      } else {
        // fallback: cari nama file di state dokumen
        const doc = documents.find(doc => doc._id === documentId);
        if (doc && doc.fileName) filename = doc.fileName;
      }
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document: ' + (error.response?.data?.message || 'Unknown error'));
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
        updateData.targetUser = targetUser;
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

  // Filter documents based on search term (title, placeholder id, etc)
  const filteredDocuments = documents.filter(doc => {
    const search = searchTerm.toLowerCase();
    // Cari berdasarkan title, placeholder id (angka di filePath), dan juga _id
    const idPlaceholder = (/^\d{3,5}$/.test(doc.filePath) ? doc.filePath : doc._id).toString();
    return (
      doc.title.toLowerCase().includes(search) ||
      idPlaceholder.includes(search) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(search)) ||
      (doc.targetUser && (
        doc.targetUser.username?.toLowerCase().includes(search) ||
        doc.targetUser.fullname?.toLowerCase().includes(search)
      ))
    );
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        {/* Show Add button for admin and staff */}
        {(userRole === 'admin' || userRole === 'staff') && (
          <Button
            variant="contained"
            onClick={() => setAddDialog(true)}
          >
            Add New Document
          </Button>
        )}
      </Box>
      
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
        <Alert severity="error" sx={{ mt: 2 }}>
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
              <TableCell>User Tujuan</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc._id}>
                {/* Kolom ID: tampilkan placeholderId jika ada, jika tidak tampilkan _id */}
                <TableCell align="left">
                  {doc.placeholderId ? doc.placeholderId : doc._id}
                </TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.status}</TableCell>
                <TableCell>{doc.bp !== null && doc.bp !== undefined ? doc.bp : '-'}</TableCell>
                <TableCell>{doc.kodeBahan || '-'}</TableCell>
                <TableCell>{doc.tipeBahan || '-'}</TableCell>
                <TableCell>{formatDate(doc.submissionDate)}</TableCell>
                <TableCell>{formatDate(doc.lastModified)}</TableCell>
                <TableCell>{doc.targetUser ? `${doc.targetUser.username} - ${doc.targetUser.fullname}` : '-'}</TableCell>
                <TableCell>
                  {/* Admin & staff: tombol Edit, Delete selalu tampil. Download hanya jika sudah upload. User/owner: hanya download/waiting */}
                  {(userRole === 'admin' || userRole === 'staff') ? (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(doc)}
                        sx={{ ml: 0 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(doc)}
                        sx={{ ml: 1 }}
                      >
                        Delete
                      </Button>
                      {doc.fileName && doc.fileName !== 'placeholder.txt' && (
                        <IconButton onClick={() => handleDownloadDocument(doc._id)} sx={{ ml: 1 }}>
                          <DownloadIcon />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    (!doc.fileName || doc.fileName === 'placeholder.txt') ? (
                      <span style={{ color: '#aaa', fontWeight: 500 }}>waiting</span>
                    ) : (
                      <IconButton onClick={() => handleDownloadDocument(doc._id)}>
                        <DownloadIcon />
                      </IconButton>
                    )
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
                
                {/* Pilih user tujuan dokumen dengan fitur search */}
                <Autocomplete
                  options={userList}
                  getOptionLabel={(option) => `${option.username} - ${option.fullname}`}
                  value={userList.find(user => user._id === targetUser) || null}
                  onChange={(_, value) => setTargetUser(value ? value._id : '')}
                  renderInput={(params) => (
                    <TextField {...params} label="User Tujuan" variant="outlined" required />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}
                />
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
                    required
                  />
                  
                  {/* Campo Kode Bahan */}
                  <TextField
                    margin="dense"
                    label="Kode Bahan"
                    type="text"
                    value={newDocKodeBahan}
                    onChange={e => setNewDocKodeBahan(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                    required
                  />
                  
                  {/* Campo Tipe Bahan (dropdown) */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }} required>
                    <InputLabel>Tipe Bahan</InputLabel>
                    <Select
                      value={newDocTipeBahan}
                      label="Tipe Bahan"
                      onChange={e => setNewDocTipeBahan(e.target.value)}
                      required
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
                
                {/* Pilih user tujuan dokumen dengan fitur search */}
                <Autocomplete
                  options={userList}
                  getOptionLabel={(option) => `${option.username} - ${option.fullname}`}
                  value={userList.find(user => user._id === targetUser) || null}
                  onChange={(_, value) => setTargetUser(value ? value._id : '')}
                  renderInput={(params) => (
                    <TextField {...params} label="User Tujuan" variant="outlined" required />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}
                />
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
                
                // Validasi wajib BP, Kode Bahan, Tipe Bahan untuk admin dan staff
                if ((userRole === 'admin' || userRole === 'staff') && (!newDocBP || !newDocKodeBahan || !newDocTipeBahan)) {
                  setAddError('BP, Kode Bahan, dan Tipe Bahan wajib diisi!');
                  setAddLoading(false);
                  return;
                }
                
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
                  documentData.targetUser = targetUser;
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
                setTargetUser('');
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
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
    </Container>
  );
};

export default Dashboard;
