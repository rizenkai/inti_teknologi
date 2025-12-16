import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/lightDarkTheme';
import {
  Box,
  Container,
  Typography,
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
  Grid,
  Pagination,
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon, 
  Search as SearchIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';

const Documents = () => {
  // Theme context
  const { isDarkMode } = useTheme();
  // eslint-disable-next-line no-unused-vars
  const theme = getTheme(isDarkMode);
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for filters
  const [filters, setFilters] = useState({
    fileType: 'All',
    status: 'All',
    dateRange: 'All'
  });
  // eslint-disable-next-line no-unused-vars
  const [showAdvancedFilter] = useState(false);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const rowsPerPageOptions = [6, 9, 12, 24];
  
  // State for upload dialog
  const [uploadDialog, setUploadDialog] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [openUploadDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null); // For updating existing document
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingDownload] = useState({});
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
      const response = await axios.get(`${API_URL}/api/documents`, {
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
      axios.get(`${API_URL}/api/auth/regular-users`, {
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
  const handleDownloadDocument = (documentId) => {
    const doc = documents.find(doc => doc._id === documentId);
    if (doc && doc.filePath && doc.filePath.startsWith('http')) {
      window.open(doc.filePath, '_blank');
      return;
    }
    alert('File tidak tersedia. Silakan upload ulang dokumen.');
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
      
      // Debug: cek nama file yang akan diupload
      console.log('DEBUG upload: selectedFile.name =', selectedFile && selectedFile.name, selectedFile);
      // Append file
      if (selectedFile && selectedFile.name) {
        formData.append('file', selectedFile, selectedFile.name);
      } else {
        formData.append('file', selectedFile);
      }
      
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
      
      const response = await axios.post(`${API_URL}/api/documents`, formData, {
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
  

  
  // Fungsi untuk melakukan filter berdasarkan date range
  const filterByDateRange = (doc, dateRange) => {
    if (dateRange === 'All') return true;
    
    const docDate = doc.uploadDate || doc.lastModified || doc.createdAt;
    if (!docDate) return false;
    
    const today = new Date();
    const docDateTime = new Date(docDate);
    
    // Reset jam ke 00:00:00
    today.setHours(0, 0, 0, 0);
    
    switch (dateRange) {
      case 'Today':
        return docDateTime >= today;
      case 'This Week': {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Minggu = 0, Senin = 1, dst
        return docDateTime >= firstDayOfWeek;
      }
      case 'This Month': {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return docDateTime >= firstDayOfMonth;
      }
      case 'This Year': {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        return docDateTime >= firstDayOfYear;
      }
      default:
        return true;
    }
  };
  
  // Fungsi untuk mendapatkan tipe file dari nama file
  const getFileType = (fileName) => {
    if (!fileName) return '-';
    
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName === 'placeholder.txt') return '-';
    
    if (lowerFileName.endsWith('.pdf')) return 'PDF';
    if (lowerFileName.endsWith('.doc')) return 'DOC';
    if (lowerFileName.endsWith('.docx')) return 'DOCX';
    if (lowerFileName.endsWith('.xls')) return 'XLS';
    if (lowerFileName.endsWith('.xlsx')) return 'XLSX';
    if (lowerFileName.endsWith('.csv')) return 'CSV';
    if (lowerFileName.endsWith('.ppt')) return 'PPT';
    if (lowerFileName.endsWith('.pptx')) return 'PPTX';
    if (lowerFileName.endsWith('.txt')) return 'TXT';
    
    // Ekstrak ekstensi file
    const extension = lowerFileName.split('.').pop();
    return extension ? extension.toUpperCase() : 'OTHER';
  };
  
  // Fungsi untuk melakukan filter berdasarkan tipe file
  const filterByFileType = (doc, fileType) => {
    if (fileType === 'All') return true;
    if (!doc.fileName) return false;
    
    const actualFileType = getFileType(doc.fileName);
    return actualFileType === fileType;
  };
  
  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    // Filter berdasarkan search term (nama dan ID placeholder)
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || 
      (doc.namaProyek || '').toString().toLowerCase().includes(search) ||
      (doc.title || '').toString().toLowerCase().includes(search) ||
      (doc._id || '').toString().toLowerCase().includes(search) ||
      (doc.placeholderId || '').toString().toLowerCase().includes(search);
    
    // Filter berdasarkan status
    const matchesStatus = filters.status === 'All' || doc.status === filters.status;
    
    // Filter berdasarkan tipe file
    const matchesFileType = filterByFileType(doc, filters.fileType);
    
    // Filter berdasarkan date range
    const matchesDateRange = filterByDateRange(doc, filters.dateRange);
    
    return matchesSearch && matchesStatus && matchesFileType && matchesDateRange;
  });
  
  // Format date for display
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle reset button click
  const handleReset = () => {
    setSearchTerm('');
    setFilters({
      fileType: 'All',
      status: 'All',
      dateRange: 'All'
    });
  };
  
  return (
    <Box sx={{ minHeight: '100vh', width: '100%', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif', color: theme.text.primary, backgroundColor: theme.background.default, overflowX: 'hidden' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* Filter Section */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: isDarkMode ? theme.background.card : 'white', 
          borderRadius: 2, 
          boxShadow: isDarkMode ? theme.shadows.card : '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${isDarkMode ? theme.border.main : '#e0e0e0'}`,
          outline: `2px solid ${isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.08)'}`
        }}>
          <Grid container spacing={3}>
            {/* Keywords */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: isDarkMode ? theme.text.secondary : '#666' }}>Cari Dokumen</Typography>
              <TextField
                fullWidth
                placeholder="Cari Dokumen..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchTerm(searchTerm.trim());
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: isDarkMode ? theme.text.secondary : '#999', mr: 1, display: 'flex', alignItems: 'center' }}>
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                  sx: {
                    color: isDarkMode ? theme.text.primary : 'inherit',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: isDarkMode ? theme.background.paper : '#fff',
                    '& fieldset': {
                      borderColor: isDarkMode ? theme.border.main : 'rgba(0, 0, 0, 0.23)',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? theme.border.hover : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                      borderWidth: '1px',
                      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(25,118,210,0.1)'}`,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? theme.text.primary : 'inherit',
                    '&::placeholder': {
                      color: isDarkMode ? theme.text.disabled : 'rgba(0, 0, 0, 0.54)',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Grid>

            {/* Filter Row */}
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: isDarkMode ? theme.text.secondary : '#666' }}>Tipe</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.fileType}
                  onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? '#1e2430' : 'white',
                    color: isDarkMode ? theme.text.primary : 'inherit',
                    opacity: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.main : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.hover : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                    },
                    '& .MuiSvgIcon-root': {
                      color: isDarkMode ? theme.text.secondary : 'inherit',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: isDarkMode ? '#1e2430' : 'white',
                        color: isDarkMode ? theme.text.primary : 'inherit',
                        '& .MuiMenuItem-root': {
                          bgcolor: isDarkMode ? '#1e2430' : 'white',
                        },
                        '& .MuiMenuItem-root:hover': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.04)',
                        },
                        '& .MuiMenuItem-root.Mui-selected': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.08)',
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="All">Semua</MenuItem>
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="DOC">DOC</MenuItem>
                  <MenuItem value="DOCX">DOCX</MenuItem>
                  <MenuItem value="XLS">XLS</MenuItem>
                  <MenuItem value="XLSX">XLSX</MenuItem>
                  <MenuItem value="CSV">CSV</MenuItem>
                  <MenuItem value="PPT">PPT</MenuItem>
                  <MenuItem value="PPTX">PPTX</MenuItem>
                  <MenuItem value="TXT">TXT</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: isDarkMode ? theme.text.secondary : '#666' }}>Status</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? '#1e2430' : 'white',
                    color: isDarkMode ? theme.text.primary : 'inherit',
                    opacity: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.main : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.hover : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                    },
                    '& .MuiSvgIcon-root': {
                      color: isDarkMode ? theme.text.secondary : 'inherit',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: isDarkMode ? '#1e2430' : 'white',
                        color: isDarkMode ? theme.text.primary : 'inherit',
                        '& .MuiMenuItem-root': {
                          bgcolor: isDarkMode ? '#1e2430' : 'white',
                        },
                        '& .MuiMenuItem-root:hover': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.04)',
                        },
                        '& .MuiMenuItem-root.Mui-selected': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.08)',
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="All">Semua</MenuItem>
                  <MenuItem value="pending">Menunggu</MenuItem>
                  <MenuItem value="review">Ditinjau</MenuItem>
                  <MenuItem value="in_progress">Dalam Proses</MenuItem>
                  <MenuItem value="completed">Selesai</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: isDarkMode ? theme.text.secondary : '#666' }}>Rentang Tanggal</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? '#1e2430' : 'white',
                    color: isDarkMode ? theme.text.primary : 'inherit',
                    opacity: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.main : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.border.hover : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                    },
                    '& .MuiSvgIcon-root': {
                      color: isDarkMode ? theme.text.secondary : 'inherit',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: isDarkMode ? '#1e2430' : 'white',
                        color: isDarkMode ? theme.text.primary : 'inherit',
                        '& .MuiMenuItem-root': {
                          bgcolor: isDarkMode ? '#1e2430' : 'white',
                        },
                        '& .MuiMenuItem-root:hover': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.04)',
                        },
                        '& .MuiMenuItem-root.Mui-selected': {
                          bgcolor: isDarkMode ? '#2c3546' : 'rgba(0, 0, 0, 0.08)',
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="All">Semua</MenuItem>
                  <MenuItem value="Today">Hari Ini</MenuItem>
                  <MenuItem value="This Week">Minggu Ini</MenuItem>
                  <MenuItem value="This Month">Bulan Ini</MenuItem>
                  <MenuItem value="This Year">Tahun Ini</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
              sx={{
                ml: 1, 
                borderRadius: 2,
                borderColor: isDarkMode ? theme.primary.main : '#0091ea',
                color: isDarkMode ? theme.primary.main : '#0091ea',
                '&:hover': { 
                  bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.08)' : 'rgba(0, 145, 234, 0.08)',
                  borderColor: isDarkMode ? theme.primary.light : '#03a9f4'
                },
                textTransform: 'none',
                px: 3
              }}
            >
              Atur Ulang
            </Button>
          </Box>
        </Box>

      
      
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
        <Alert severity="info">Tidak ada dokumen ditemukan</Alert>
      ) : (
        <>
        <Grid container spacing={3}>
          {filteredDocuments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <Paper 
                elevation={0} 
                sx={{
                  background: isDarkMode ? theme.background.card : 'white',
                  borderRadius: 2,
                  boxShadow: isDarkMode ? theme.shadows.card : '0 2px 8px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  border: `1px solid ${isDarkMode ? theme.border.main : '#e0e0e0'}`,
                  outline: `2px solid ${isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.08)'}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {/* Title Section */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: isDarkMode ? `1px solid ${theme.border.main}` : '1px solid rgba(0,0,0,0.08)',
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(25,118,210,0.03)'
                }}>
                  <Typography sx={{ 
                    fontWeight: 600, 
                    fontSize: '1rem', 
                    color: isDarkMode ? theme.primary.main : '#1976d2',
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.4
                  }}>
                    {doc.namaProyek || doc.title || 'Pengujian di Serpong'}
                  </Typography>
                  {(doc.placeholderId || doc._id) && (
                    <Typography sx={{ fontSize: '0.75rem', color: isDarkMode ? theme.text.secondary : '#888' }}>
                      #{doc.placeholderId || doc._id}
                    </Typography>
                  )}
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    {/* File Type */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: isDarkMode ? theme.text.secondary : '#666', fontWeight: 500 }}>
                        Tipe File
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: isDarkMode ? theme.text.primary : '#333', fontWeight: 500 }}>
                        {(doc.fileName && doc.fileName !== 'placeholder.txt' && (doc.status === 'completed' || doc.status === 'approved')) ? 
                          getFileType(doc.fileName) : '-'}
                      </Typography>
                    </Box>

                    {/* Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: isDarkMode ? theme.text.secondary : '#666', fontWeight: 500 }}>
                        Status
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1,
                        bgcolor: isDarkMode ? (
                          doc.status === 'completed' ? 'rgba(76, 175, 80, 0.2)' : 
                          doc.status === 'pending' ? 'rgba(255, 152, 0, 0.2)' : 
                          doc.status === 'rejected' ? 'rgba(244, 67, 54, 0.2)' : 
                          'rgba(33, 150, 243, 0.2)'
                        ) : (
                          doc.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
                          doc.status === 'pending' ? 'rgba(255, 152, 0, 0.1)' : 
                          doc.status === 'rejected' ? 'rgba(244, 67, 54, 0.1)' : 
                          'rgba(33, 150, 243, 0.1)'
                        ),
                        color: isDarkMode ? (
                          doc.status === 'completed' ? '#81c784' : 
                          doc.status === 'pending' ? '#ffb74d' : 
                          doc.status === 'rejected' ? '#e57373' : 
                          '#64b5f6'
                        ) : (
                          doc.status === 'completed' ? '#388e3c' : 
                          doc.status === 'pending' ? '#f57c00' : 
                          doc.status === 'rejected' ? '#d32f2f' : 
                          '#1976d2'
                        ),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}>
                        {doc.status === 'pending' ? 'Menunggu' : 
                          doc.status === 'review' ? 'Ditinjau' : 
                          doc.status === 'in_progress' ? 'Dalam Proses' : 
                          doc.status === 'completed' ? 'Selesai' : 
                          doc.status === 'approved' ? 'Disetujui' : 
                          doc.status === 'rejected' ? 'Ditolak' : 
                          doc.status || (index % 3 === 0 ? 'Selesai' : index % 3 === 1 ? 'Menunggu' : 'Dalam Proses')}
                      </Box>
                    </Box>

                    {/* Upload Date */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: isDarkMode ? theme.text.secondary : '#666', fontWeight: 500 }}>
                        Tanggal Unggah
                      </Typography>
                      <Box>
                        {(doc.fileName && doc.fileName !== 'placeholder.txt' && (doc.status === 'completed' || doc.status === 'approved')) ? (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.85rem', color: isDarkMode ? theme.text.primary : '#333', fontWeight: 500 }}>
                              {formatDate(doc.uploadDate || new Date())}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: isDarkMode ? theme.text.secondary : '#888' }}>
                              oleh {doc.uploadedBy?.fullname || doc.createdBy?.fullname || (index % 2 === 0 ? 'Admin' : 'Staff')}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.85rem', color: isDarkMode ? theme.text.disabled : '#888', fontWeight: 500 }}>
                            -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ 
                    mt: 2, 
                    pt: 2, 
                    borderTop: isDarkMode ? `1px solid ${theme.border.main}` : '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', 
                    justifyContent: 'center'
                  }}>
                    {/* Kondisi untuk tampilan tombol atau pesan */}
                    {(doc.status !== 'completed' && doc.status !== 'approved') ? (
                      /* Jika status belum completed, tampilkan "Waiting to Complete" */
                      <Typography sx={{ fontSize: '0.85rem', color: isDarkMode ? theme.text.disabled : '#888' }}>Menunggu Selesai</Typography>
                    ) : (
                      /* Jika status completed, cek apakah file sudah diupload */
                      (doc.fileName && doc.fileName !== 'placeholder.txt') ? (
                        /* Jika file sudah diupload, tampilkan tombol download */
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={loadingDownload[doc._id]}
                          onClick={() => handleDownloadDocument(doc._id)}
                          startIcon={loadingDownload[doc._id] ? <CircularProgress size={16} /> : <DownloadIcon />}
                          sx={{
                            borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                            color: isDarkMode ? theme.primary.main : '#1976d2',
                            '&:hover': { borderColor: isDarkMode ? theme.primary.light : '#42a5f5', bgcolor: isDarkMode ? 'rgba(65,227,255,0.08)' : 'rgba(33,150,243,0.08)' },
                            textTransform: 'none',
                            minWidth: '120px',
                            px: 2
                          }}
                        >
                          Unduh
                        </Button>
                      ) : null
                    )}
                    
                    {/* Tombol Update/Upload untuk admin/staff - hanya tampil jika status completed atau approved */}
                    {(userRole === 'admin' || userRole === 'staff') && (doc.status === 'completed' || doc.status === 'approved') && (
                      <Box sx={{ ml: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setDocumentData({
                              title: doc.namaProyek || doc.title,
                              description: doc.description || '',
                              department: doc.department || '',
                              placeholderId: doc.placeholderId || ''
                            });
                            setUploadDialog(true);
                          }}
                          sx={{
                            bgcolor: isDarkMode ? theme.primary.main : '#1976d2',
                            color: 'white',
                            '&:hover': { bgcolor: isDarkMode ? theme.primary.dark : '#1565c0' },
                            textTransform: 'none',
                            minWidth: '120px',
                            px: 2
                          }}
                        >
                          {doc.fileName && doc.fileName !== 'placeholder.txt' ? 'Perbarui' : 'Unggah'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {/* Pagination */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ mb: { xs: 2, sm: 0 }, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, color: isDarkMode ? theme.text.secondary : '#666' }}>
              Menampilkan {Math.min(page * rowsPerPage + 1, filteredDocuments.length)} hingga {Math.min((page + 1) * rowsPerPage, filteredDocuments.length)} dari {filteredDocuments.length} entri
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, color: isDarkMode ? theme.text.secondary : '#666' }}>
                Show
              </Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(e.target.value);
                    setPage(0); // Reset to first page when changing items per page
                  }}
                  sx={{
                    bgcolor: isDarkMode ? theme.background.paper : 'white',
                    '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    borderRadius: 1,
                    boxShadow: isDarkMode ? theme.shadows.card : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {rowsPerPageOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ ml: 2, color: isDarkMode ? theme.text.secondary : '#666' }}>
                entries
              </Typography>
            </Box>
            
            <Pagination 
              count={Math.ceil(filteredDocuments.length / rowsPerPage)} 
              page={page + 1} 
              onChange={(event, newPage) => setPage(newPage - 1)}
              color="primary"
              variant="outlined"
              shape="rounded"
              size="medium"
              siblingCount={0}
              boundaryCount={1}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: isDarkMode ? theme.text.primary : 'inherit',
                  bgcolor: isDarkMode ? theme.background.paper : 'white',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  '&.Mui-selected': {
                    bgcolor: isDarkMode ? theme.primary.main : '#1976d2',
                    color: 'white',
                    borderColor: isDarkMode ? theme.primary.main : '#1976d2',
                    '&:hover': {
                      bgcolor: isDarkMode ? theme.primary.dark : '#1565c0'
                    }
                  },
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                  }
                }
              }}
            />
          </Box>
        </Box>
        </>
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
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      name="category"
                      value={documentData.category}
                      label="Kategori"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="general">Umum</MenuItem>
                      <MenuItem value="report">Laporan</MenuItem>
                      <MenuItem value="contract">Kontrak</MenuItem>
                      <MenuItem value="invoice">Faktur</MenuItem>
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
                      <MenuItem value="pending">Menunggu</MenuItem>
                      <MenuItem value="review">Ditinjau</MenuItem>
                      <MenuItem value="in_progress">Dalam Proses</MenuItem>
                      <MenuItem value="completed">Selesai</MenuItem>
                      <MenuItem value="approved">Disetujui</MenuItem>
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
                Tipe file yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, dll.
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
          <Button onClick={() => setUploadDialog(false)}>Batal</Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            disabled={uploadLoading || !selectedFile || (!selectedDocument && !documentData.title)}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Unggah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Documents;
