import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
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
  Grid,
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon, 
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const Documents = () => {
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
    status: 'completed'
  });
  
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
  
  // Avoid duplicate fetching by debouncing
  const fetchDocumentsDebounced = useCallback(
    debounce(() => {
      fetchDocuments();
    }, 300),
    []
  );
  
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
      
      // If user is not admin, only show completed documents
      if (userRole !== 'admin') {
        const completedDocs = response.data.documents.filter(doc => 
          doc.status === 'completed' || doc.status === 'approved'
        );
        setDocuments(completedDocs);
      } else {
        // Ensure we don't have duplicates by using document ID as unique key
        const uniqueDocs = {};
        response.data.documents.forEach(doc => {
          uniqueDocs[doc._id] = doc;
        });
        setDocuments(Object.values(uniqueDocs));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };
  
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
    try {
      const token = localStorage.getItem('token');
      
      // Show loading indicator
      const downloadButton = document.getElementById(`download-${documentId}`);
      if (downloadButton) {
        // Save original content
        const originalContent = downloadButton.innerHTML;
        downloadButton.innerHTML = '...';
        downloadButton.disabled = true;
      }
      
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
      alert('Failed to download document: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      // Reset download button
      const downloadButton = document.getElementById(`download-${documentId}`);
      if (downloadButton) {
        // Restore button
        downloadButton.innerHTML = '';
        const icon = document.createElement('span');
        icon.className = 'MuiSvgIcon-root';
        icon.innerHTML = '<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>';
        downloadButton.appendChild(icon);
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
          status: 'completed'
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
  

  
  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Search documents..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {userRole === 'admin' && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialog(true)}
              sx={{ height: '100%' }}
            >
              Upload Document
            </Button>
          )}
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploaded Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.description}</TableCell>
                  <TableCell>{doc.fileType}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: 
                          doc.status === 'completed' ? 'success.light' : 
                          doc.status === 'approved' ? 'success.main' :
                          doc.status === 'pending' ? 'warning.light' :
                          doc.status === 'in_progress' ? 'info.light' :
                          doc.status === 'review' ? 'secondary.light' :
                          'error.light',
                        color: 'white',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        display: 'inline-block'
                      }}
                    >
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(doc.submissionDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton 
                        id={`download-${doc._id}`}
                        color="primary" 
                        onClick={() => handleDownloadDocument(doc._id)}
                        title="Download Document"
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                      
                      {userRole === 'admin' && (
                        <IconButton 
                          color="secondary" 
                          onClick={() => {
                            // Set the selected document for updating
                            setSelectedDocument(doc);
                            setDocumentData({
                              title: doc.title,
                              description: doc.description || '',
                              category: doc.category || 'general',
                              status: doc.status || 'completed'
                            });
                            setUploadDialog(true);
                          }}
                          title="Upload File"
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      )}
                    </Box>
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
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDocument ? `Upload File for "${selectedDocument.title}"` : 'Upload New Document'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Only show document metadata fields for new documents */}
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
  );
};

export default Documents;
