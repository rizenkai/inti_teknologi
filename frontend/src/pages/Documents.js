import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material';
import { getTheme, getStatusColor, getStatusTextColor } from '../theme/lightDarkTheme';
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
  Grid,
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon, 
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const Documents = () => {
  // Theme context
  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const theme = getTheme(isDarkMode);
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for upload dialog
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null); // For updating existing document
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: 'general',
    status: 'pending',
    targetUser: ''
  });
  const [userList, setUserList] = useState([]);

  // Get user role from localStorage
  let userRole = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user?.role || '';
  } catch {}
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Function to fetch documents
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
      
      // Semua role (admin, staff, user) dapat melihat seluruh dokumen yang diberikan backend
      // Tidak perlu filter tambahan di frontend
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
  
  // Fetch user list only for admin/staff
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'staff') {
      const token = localStorage.getItem('token');
      axios.get('http://localhost:5000/api/auth/regular-users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUserList(res.data))
      .catch(() => setUserList([]));
    }
  }, [userRole]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  // Handle input change for document form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle document download
  const handleDownloadDocument = async (documentId) => {
    let originalContent = null;
    try {
      const token = localStorage.getItem('token');
      // Show loading indicator
      const downloadButton = window.document.getElementById(`download-${documentId}`);
      if (downloadButton) {
        originalContent = downloadButton.innerHTML;
        downloadButton.innerHTML = '...';
        downloadButton.disabled = true;
      }
      // Make API request to download the document
      const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
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
      alert('Failed to download document: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      // Reset download button
      const downloadButton = window.document.getElementById(`download-${documentId}`);
      if (downloadButton) {
        // Restore button
        downloadButton.innerHTML = originalContent || '';
        downloadButton.disabled = false;
      }
    }
  };
  
  // Handle document upload
  const handleUploadDocument = async () => {
    // Validate inputs
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    // If we're updating an existing document, we don't need a title
    if (!selectedDocument && (!documentData.title || documentData.title.trim() === '')) {
      setUploadError('Document title is required');
      return;
    }
    
    setUploadLoading(true);
    setUploadError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append file
      formData.append('file', selectedFile);
      
      // If we're updating an existing document
      if (selectedDocument) {
        formData.append('documentId', selectedDocument._id);
      } else {
        // For new document, append all metadata
        formData.append('title', documentData.title.trim());
        formData.append('description', documentData.description?.trim() || '');
        formData.append('category', documentData.category);
        formData.append('status', documentData.status);
      }
      
      // Only add targetUser if admin or staff
      if (userRole === 'admin' || userRole === 'staff') {
        formData.append('targetUser', documentData.targetUser);
      }
      
      // Add a unique identifier to prevent caching issues
      const timestamp = new Date().getTime();
      formData.append('timestamp', timestamp);
      
      const response = await axios.post('http://localhost:5000/api/documents', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Only close dialog and reset form if upload was successful
      if (response.data.success) {
        setUploadDialog(false);
        setSelectedFile(null);
        setSelectedDocument(null);
        setDocumentData({
          title: '',
          description: '',
          category: 'general',
          status: 'completed',
          targetUser: ''
        });
        
        // Wait a moment before fetching to ensure server has processed the upload
        setTimeout(() => {
          fetchDocuments(); // Use direct fetch instead of debounced to ensure fresh data
        }, 500);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      setUploadError(errorMessage);
      
      // Show alert for duplicate document error
      if (errorMessage.includes('already exists')) {
        alert('A document with this title already exists. Please use a different title.');
      }
    } finally {
      setUploadLoading(false);
    }
  };
  

  
  // Filter documents based on search term (title, placeholder id, etc)
  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm || searchTerm.trim() === '') return true; // Show all documents if search is empty
    
    const search = searchTerm.toLowerCase().trim();
    
    // Cari berdasarkan namaProyek, title, ID, dan informasi lainnya
    const namaProyek = (doc.namaProyek || '').toString().toLowerCase();
    const title = (doc.title || '').toString().toLowerCase();
    const docId = (doc._id || '').toString().toLowerCase();
    const placeholderId = (doc.placeholderId || '').toString().toLowerCase();
    const fileName = (doc.fileName || '').toString().toLowerCase();
    const fileType = (doc.fileType || '').toString().toLowerCase();
    const status = (doc.status || '').toString().toLowerCase();
    
    // Untuk debugging
    console.log(`Searching for: "${search}" in doc:`, {
      id: docId,
      namaProyek,
      title,
      placeholderId,
      fileName,
      fileType,
      status
    });
    
    return (
      namaProyek.includes(search) ||
      title.includes(search) ||
      docId.includes(search) ||
      placeholderId.includes(search) ||
      fileName.includes(search) ||
      fileType.includes(search) ||
      status.includes(search) ||
      (doc.targetUser && (
        (doc.targetUser.username || '').toLowerCase().includes(search) ||
        (doc.targetUser.fullname || '').toLowerCase().includes(search)
      ))
    );
  });
  
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: theme.text.primary, fontWeight: 800, letterSpacing: 1 }}>Document List</Typography>
        </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Cari Dokumen"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              console.log('Search term changed:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log('Search submitted:', searchTerm);
                // Force re-render to refresh filtered results
                setSearchTerm(searchTerm.trim());
              }
            }}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ color: theme.text.secondary, mr: 1, fontSize: 14, display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 4 }}>🔍</span>
                </Box>
              ),
              style: {
                color: theme.text.primary,
                background: theme.background.hover,
                borderRadius: 12,
                border: `1.5px solid ${theme.border.main}`,
                boxShadow: theme.shadows.input
              }
            }}
            InputLabelProps={{ style: { color: theme.text.secondary, fontWeight: 600 } }}
            sx={{
              input: { color: theme.text.primary },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border.main },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.border.hover },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary.main }
            }}
          />
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Alert severity="info">No documents found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{
           background: theme.background.card,
           borderRadius: 3,
           boxShadow: theme.shadows.card,
           border: `1.5px solid ${theme.border.main}`,
           backdropFilter: 'blur(8px)',
         }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: theme.background.tableHeader }}>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>ID</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>Nama Proyek</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>File Type</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>Status</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>User Tujuan</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>Submitted Date</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>Document Uploaded</TableCell>
                <TableCell sx={{ color: theme.primary.main, fontWeight: 700, fontSize: 16 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc._id} sx={{ '&:hover': { background: theme.background.hover } }}>
                  {/* Kolom ID: tampilkan placeholderId jika ada, jika tidak tampilkan _id */}
                  <TableCell align="left" sx={{ color: theme.text.primary, fontWeight: 500 }}>
                    {doc.placeholderId ? doc.placeholderId : doc._id}
                  </TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{doc.namaProyek || doc.title}</TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{
                    doc.fileName && doc.fileName !== 'placeholder.txt'
                      ? (doc.fileName.split('.').pop() || '-').toLowerCase()
                      : '-'
                    }
                  </TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 700, letterSpacing: 0.5 }}>
                    <Box
                      sx={{
                        backgroundColor: getStatusColor(doc.status, isDarkMode),
                        color: getStatusTextColor(doc.status, isDarkMode),
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 14,
                        display: 'inline-block',
                        minWidth: 100,
                        textAlign: 'center',
                        letterSpacing: 1
                      }}
                    >
                      {doc.status?.toUpperCase()}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{doc.targetUser ? `${doc.targetUser.username} - ${doc.targetUser.fullname}` : '-'}</TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{doc.submissionDate ? formatDate(doc.submissionDate) : '-'}</TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>{doc.fileName && doc.fileName !== 'placeholder.txt' ? formatDate(doc.lastModified) : '-'}</TableCell>
                  <TableCell sx={{ color: theme.text.primary, fontWeight: 500 }}>
                    {/* Jika dokumen masih placeholder/manual dan status belum completed, tampilkan "waiting to complete" */}
                    {doc.fileName === 'placeholder.txt' && doc.status !== 'completed' ? (
                      <span style={{ color: isDarkMode ? '#aaa' : '#777', fontWeight: 500 }}>waiting to complete</span>
                    ) : (
                      // Tampilkan tombol download & aksi lain jika sudah completed/file sudah diupload
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {doc.fileName && doc.fileName !== 'placeholder.txt' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadDocument(doc._id)}
                            sx={{
                              bgcolor: theme.primary.main,
                              color: theme.primary.contrastText,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: theme.primary.dark },
                              borderRadius: 2,
                              textTransform: 'none',
                              boxShadow: theme.shadows.button
                            }}
                          >
                            Download
                          </Button>
                        )}
                        
                        {(userRole === 'admin' || userRole === 'staff') && (
                          // Cek apakah dokumen sudah memiliki file yang diupload
                          // Jika fileName ada dan bukan placeholder.txt, berarti sudah ada file
                          doc.fileName && doc.fileName !== 'placeholder.txt' ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<DownloadIcon sx={{ transform: 'rotate(180deg)' }} />}
                              onClick={() => {
                                setSelectedDocument(doc);
                                setDocumentData({
                                  title: doc.namaProyek || doc.title,
                                  description: doc.description || '',
                                  category: doc.category || 'general',
                          status: doc.status || 'completed',
                          mutuBahan: doc.mutuBahan || '',
                          tipeBahan: doc.tipeBahan || '',
                          targetUser: doc.targetUser || ''
                        });
                        setUploadDialog(true);
                      }}
                              sx={{
                                bgcolor: isDarkMode ? '#ff9800' : '#ff9800',
                                color: isDarkMode ? '#111a2b' : '#111a2b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: isDarkMode ? '#f57c00' : '#f57c00' },
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: isDarkMode ? '0 2px 8px rgba(255,152,0,0.25)' : '0 2px 8px rgba(255,152,0,0.15)'
                              }}
                            >
                              Update
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                setSelectedDocument(doc);
                                setDocumentData({
                                  title: doc.namaProyek || doc.title,
                                  description: doc.description || '',
                                  category: doc.category || 'general',
                          status: doc.status || 'completed',
                          mutuBahan: doc.mutuBahan || '',
                          tipeBahan: doc.tipeBahan || '',
                          targetUser: doc.targetUser || ''
                        });
                        setUploadDialog(true);
                      }}
                              sx={{
                                bgcolor: isDarkMode ? '#4caf50' : '#4caf50',
                                color: isDarkMode ? '#111a2b' : '#111a2b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: isDarkMode ? '#388e3c' : '#388e3c' },
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: isDarkMode ? '0 2px 8px rgba(76,175,80,0.25)' : '0 2px 8px rgba(76,175,80,0.15)'
                              }}
                            >
                              Upload
                            </Button>
                          )
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialog} onClose={() => {
        setUploadDialog(false);
        setSelectedDocument(null); // Clear selected document when closing dialog
      }} maxWidth="md" fullWidth
      PaperProps={{
        sx: {
          background: theme.background.card,
          color: theme.text.primary,
          borderRadius: 3,
          boxShadow: theme.shadows.card,
          border: `1.5px solid ${theme.border.main}`,
          backdropFilter: 'blur(8px)',
          p: { xs: 2, md: 2 },
        }
      }}>
        <DialogTitle>
          {selectedDocument ? `Upload File untuk "${selectedDocument.namaProyek || selectedDocument.title || 'Dokumen'}"` : 'Upload Dokumen Baru'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Only show document metadata fields for new documents */}

            {/* Kolom Mutu Bahan dan Tipe Bahan telah dihapus sesuai permintaan */}
            {!selectedDocument && (
              <>
                <Grid item xs={12}>
                  <TextField
  name="title"
  label="Document Title"
  fullWidth
  required
  value={documentData.title}
  onChange={handleInputChange}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
  name="description"
  label="Description"
  fullWidth
  multiline
  rows={3}
  value={documentData.description}
  onChange={handleInputChange}
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: 'rgba(65,227,255,0.10)',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
    },
    sx: {
      '& textarea': { color: '#fff' },
      '& textarea::placeholder': { color: '#bdbdbd', opacity: 1 },
    }
  }}
  sx={{ mb: 2, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' } }}
/>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={documentData.category}
                      label="Category"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="report">Report</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="invoice">Invoice</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={documentData.status}
                      label="Status"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="review">Review</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {/* User Tujuan tampil untuk admin dan staff saat membuat dokumen baru */}
            {(!selectedDocument && (userRole === 'admin' || userRole === 'staff')) && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>User Tujuan *</InputLabel>
                <Select
                  name="targetUser"
                  value={documentData.targetUser || ''}
                  onChange={handleInputChange}
                  required
                >
                  {userList.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} - {user.fullname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 1.5 }}
              >
                {selectedFile ? selectedFile.name : 'Select Document File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Supported file types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, etc.
              </Typography>
            </Grid>
          </Grid>
          
          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            disabled={uploadLoading || !selectedFile || (!selectedDocument && !documentData.title)}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Documents;
