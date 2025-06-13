import React, { useState, useEffect } from 'react';
import { useTheme as useMuiTheme } from '@mui/material';
import { debounce } from 'lodash';
import axios from 'axios';
import API_URL from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
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
  Autocomplete
} from '@mui/material';
import { format } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import DescriptionIcon from '@mui/icons-material/Description';
import { getDropdownStyles } from '../utils/dropdownStyles';
Chart.register(ArcElement, Tooltip, Legend);

// Status color mapping
const statusColors = {
  pending: '#FFE082',      // Kuning pastel
  review: '#FFAB91',      // Jingga pastel
  in_progress: '#80D8FF', // Biru pastel
  completed: '#A5D6A7',   // Hijau pastel
};
const statusLabels = {
  pending: 'Menunggu',
  review: 'Ditinjau',
  in_progress: 'Dalam Proses',
  completed: 'Selesai',
};

const Dashboard = () => {
  // Deskripsi untuk tipe pengujian
  const tipePengujianDescriptions = {
    Beton: '',
    Besi: ''
  };
  // NEW: State for Add Document Dialog
  const [addDialog, setAddDialog] = useState(false);

  const [newNamaProyek, setNewNamaProyek] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  
  // Nuevos estados para los campos adicionales
  const [newDocBP, setNewDocBP] = useState('');
  const [newDocKodeBahan, setNewDocKodeBahan] = useState('');
  const [newDocTipeBahan, setNewDocTipeBahan] = useState('');
  const [newDocTipePengujian, setNewDocTipePengujian] = useState('');
  const [userList, setUserList] = useState([]);
  const [targetUser, setTargetUser] = useState('');
  
  // State untuk opsi dropdown dari database
  const [mutuBahanOptions, setMutuBahanOptions] = useState([]);
  const [tipeBahanOptions, setTipeBahanOptions] = useState([]);

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
  const [confirmUpdateDialog, setConfirmUpdateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newBP, setNewBP] = useState('');
  const [newMutuBahan, setNewMutuBahan] = useState('');
  const [newTipeBahan, setNewTipeBahan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // State untuk filter status dan pagination
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9; // Maksimal 9 card per halaman (3x3 di desktop)

  const { isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();

  useEffect(() => {
    // Fetch user list only for admin/staff
    if (userRole === 'admin' || userRole === 'staff') {
      const token = localStorage.getItem('token');
      axios.get(`${API_URL}/api/auth/regular-users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUserList(response.data);
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
        
      // Fetch input options for dropdowns
      fetchInputOptions();
    }
    
    fetchDocuments();
  }, [userRole]);
  
  // Fungsi untuk mengambil opsi dropdown dari API
  const fetchInputOptions = async () => {
    try {
      // Buat array untuk nilai default
      const defaultMutuBahan = [
        { _id: 'default-1', value: 'T 280', testType: 'Besi' },
        { _id: 'default-2', value: 'T 420', testType: 'Besi' },
        { _id: 'default-3', value: 'K 225', testType: 'Beton' },
        { _id: 'default-4', value: 'K 250', testType: 'Beton' },
        { _id: 'default-5', value: 'K 300', testType: 'Beton' },
        { _id: 'default-6', value: 'K 350', testType: 'Beton' },
        { _id: 'default-7', value: 'K 400', testType: 'Beton' },
        { _id: 'default-8', value: 'K 450', testType: 'Beton' },
        { _id: 'default-9', value: 'K 500', testType: 'Beton' },
        { _id: 'default-10', value: 'K 600', testType: 'Beton' }
      ];
      
      const defaultTipeBahan = [
        { _id: 'default-11', value: 'BJTS (Ulir)', testType: 'Besi' },
        { _id: 'default-12', value: 'BJTP (Polos)', testType: 'Besi' },
        { _id: 'default-13', value: 'KUBUS', testType: 'Beton' },
        { _id: 'default-14', value: 'SILINDER', testType: 'Beton' },
        { _id: 'default-15', value: 'BALOK', testType: 'Beton' },
        { _id: 'default-16', value: 'PAVING', testType: 'Beton' },
        { _id: 'default-17', value: 'SCOUP', testType: 'Beton' }
      ];
      
      const token = localStorage.getItem('token');
      
      // Fetch mutu bahan options
      const mutuBahanResponse = await axios.get(`${API_URL}/api/inputs/values?category=mutuBahan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Gabungkan nilai default dengan nilai dari API
      let combinedMutuBahan = [...defaultMutuBahan];
      
      if (mutuBahanResponse.data && mutuBahanResponse.data.length > 0) {
        // Filter nilai dari API yang tidak ada di nilai default
        const apiMutuBahan = mutuBahanResponse.data.filter(apiItem => {
          return !defaultMutuBahan.some(defaultItem => 
            defaultItem.value === apiItem.value && defaultItem.testType === apiItem.testType
          );
        });
        
        // Gabungkan nilai default dengan nilai dari API
        combinedMutuBahan = [...defaultMutuBahan, ...apiMutuBahan];
      }
      
      setMutuBahanOptions(combinedMutuBahan);
      
      // Fetch tipe bahan options
      const tipeBahanResponse = await axios.get(`${API_URL}/api/inputs/values?category=tipeBahan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Gabungkan nilai default dengan nilai dari API
      let combinedTipeBahan = [...defaultTipeBahan];
      
      if (tipeBahanResponse.data && tipeBahanResponse.data.length > 0) {
        // Filter nilai dari API yang tidak ada di nilai default
        const apiTipeBahan = tipeBahanResponse.data.filter(apiItem => {
          return !defaultTipeBahan.some(defaultItem => 
            defaultItem.value === apiItem.value && defaultItem.testType === apiItem.testType
          );
        });
        
        // Gabungkan nilai default dengan nilai dari API
        combinedTipeBahan = [...defaultTipeBahan, ...apiTipeBahan];
      }
      
      setTipeBahanOptions(combinedTipeBahan);
    } catch (error) {
      console.error('Error fetching input options:', error);
      
      // Jika terjadi error, gunakan nilai default saja
      const defaultMutuBahan = [
        { _id: 'default-1', value: 'T 280', testType: 'Besi' },
        { _id: 'default-2', value: 'T 420', testType: 'Besi' },
        { _id: 'default-3', value: 'K 225', testType: 'Beton' },
        { _id: 'default-4', value: 'K 250', testType: 'Beton' },
        { _id: 'default-5', value: 'K 300', testType: 'Beton' },
        { _id: 'default-6', value: 'K 350', testType: 'Beton' },
        { _id: 'default-7', value: 'K 400', testType: 'Beton' },
        { _id: 'default-8', value: 'K 450', testType: 'Beton' },
        { _id: 'default-9', value: 'K 500', testType: 'Beton' },
        { _id: 'default-10', value: 'K 600', testType: 'Beton' }
      ];
      
      const defaultTipeBahan = [
        { _id: 'default-11', value: 'BJTS (Ulir)', testType: 'Besi' },
        { _id: 'default-12', value: 'BJTP (Polos)', testType: 'Besi' },
        { _id: 'default-13', value: 'KUBUS', testType: 'Beton' },
        { _id: 'default-14', value: 'SILINDER', testType: 'Beton' },
        { _id: 'default-15', value: 'BALOK', testType: 'Beton' },
        { _id: 'default-16', value: 'PAVING', testType: 'Beton' },
        { _id: 'default-17', value: 'SCOUP', testType: 'Beton' }
      ];
      
      setMutuBahanOptions(defaultMutuBahan);
      setTipeBahanOptions(defaultTipeBahan);
    }
  };

  // Status options sudah digunakan melalui statusLabels

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
      const response = await axios.get(`${API_URL}/api/documents`, {
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
    // Log dokumen untuk debugging
    console.log('Dokumen yang akan diedit:', document);
    
    // Set nilai status dengan default 'pending'
    const status = document.status || 'pending';
    console.log('Status diatur ke:', status);
    
    // Log nilai mutuBahan dan tipeBahan sebelum pengolahan
    console.log('Nilai asli mutuBahan:', document.mutuBahan);
    console.log('Nilai asli tipeBahan:', document.tipeBahan);
    
    // Inicializar los campos adicionales con los valores actuales del documento
    const bp = document.bp !== null && document.bp !== undefined ? document.bp.toString() : '';
    const mutuBahan = document.mutuBahan || '';
    const tipeBahan = document.tipeBahan || '';
    const targetUser = document.targetUser?._id || '';
    
    // Determine tipePengujian based on mutuBahan if not explicitly set
    const derivedTipePengujian = document.tipePengujian || 
      (document.mutuBahan && document.mutuBahan.startsWith('T') ? 'Besi' : 
       document.mutuBahan && document.mutuBahan.startsWith('K') ? 'Beton' : '');
    
    // Log semua nilai yang akan diatur setelah pengolahan
    console.log('Nilai yang diatur setelah pengolahan:', {
      status,
      bp,
      mutuBahan,
      tipeBahan,
      tipePengujian: derivedTipePengujian,
      targetUser
    });
    
    // Atur state dengan timeout pendek untuk memastikan UI diperbarui dengan benar
    setTimeout(() => {
      setSelectedDocument(document);
      setNewStatus(status);
      setNewBP(bp);
      setNewDocTipePengujian(derivedTipePengujian);
      
      // Atur mutuBahan dan tipeBahan setelah tipePengujian
      setNewMutuBahan(mutuBahan);
      setNewTipeBahan(tipeBahan);
      setTargetUser(targetUser);
      
      // Log setelah state diatur
      console.log('State telah diatur dengan nilai mutuBahan:', mutuBahan, 'dan tipeBahan:', tipeBahan);
    }, 0);
    
    // Buka dialog
    setEditDialog(true);
  };

  const handleDelete = (document) => {
    setSelectedDocument(document);
    setDeleteDialog(true);
  };

  // Fungsi download dokumen telah dipindahkan ke komponen lain

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/documents/${selectedDocument._id}`,
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
    // Menampilkan dialog konfirmasi terlebih dahulu
    setConfirmUpdateDialog(true);
  };

  const confirmUpdate = async () => {
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
        updateData.mutuBahan = newMutuBahan;
        updateData.tipeBahan = newTipeBahan;
        updateData.tipePengujian = newDocTipePengujian;
        updateData.targetUser = targetUser;
      }
      
      await axios.put(
        `${API_URL}/api/documents/${selectedDocument._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setConfirmUpdateDialog(false);
      setEditDialog(false);
      fetchDocumentsDebounced();
    } catch (error) {
      console.error('Error updating document:', error);
      setError(error.response?.data?.message || 'Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on search term (namaProyek, placeholder id, etc)
  const filteredByStatus = documents.filter(doc => {
    if (statusFilter === 'all') return true;
    return doc.status === statusFilter;
  });

  const filteredDocuments = filteredByStatus.filter(doc => {
    if (!searchTerm || searchTerm.trim() === '') return true; // Show all documents if search is empty
    
    const search = searchTerm.toLowerCase().trim();
    // Cari berdasarkan namaProyek, placeholder id (placeholderId, filePath, _id), dan user tujuan
    const namaProyek = (doc.namaProyek || doc.title || '').toString().toLowerCase();
    const placeholderId = (doc.placeholderId || '').toString().toLowerCase();
    const filePathId = (doc.filePath || '').toString().toLowerCase();
    const docId = (doc._id || '').toString().toLowerCase();
    const bpValue = (doc.bp !== null && doc.bp !== undefined) ? doc.bp.toString().toLowerCase() : '';
    const mutuBahan = (doc.mutuBahan || '').toString().toLowerCase();
    const tipeBahan = (doc.tipeBahan || '').toString().toLowerCase();
    
    // Log para depuración
    console.log(`Searching for: ${search} in doc:`, {
      id: docId,
      namaProyek,
      placeholderId,
      bp: bpValue,
      mutuBahan,
      tipeBahan
    });
    
    return (
      namaProyek.includes(search) ||
      placeholderId.includes(search) ||
      filePathId.includes(search) ||
      docId.includes(search) ||
      bpValue.includes(search) ||
      mutuBahan.includes(search) ||
      tipeBahan.includes(search) ||
      (doc.targetUser && (
        (doc.targetUser.username || '').toLowerCase().includes(search) ||
        (doc.targetUser.fullname || '').toLowerCase().includes(search)
      ))
    );
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredDocuments.slice(indexOfFirstCard, indexOfLastCard);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of card section
      window.scrollTo({ top: document.getElementById('card-grid').offsetTop - 100, behavior: 'smooth' });
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Pie Chart Data: hitung jumlah dokumen per status
  // Hitung jumlah dokumen per status
  const statusCounts = {};
  filteredDocuments.forEach(doc => {
    const status = doc.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const allStatus = ['pending', 'review', 'in_progress', 'completed'];
  const pieLabels = allStatus.map(s => statusLabels[s]);
  const pieColors = allStatus.map(s => isDarkMode ? {
    'pending': '#fbbf24',
    'in_progress': '#60a5fa',
    'review': '#f87171',
    'completed': '#4ade80',
  }[s] : {
    'pending': '#f59e0b',
    'in_progress': '#3b82f6',
    'review': '#ef4444',
    'completed': '#10b981',
  }[s]);
  const pieValues = allStatus.map(s => statusCounts[s] || 0);
  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: pieColors,
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { font: { size: 13 } }
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Hitung statistik
  const totalDocs = documents.length;
  // const storageUsed = 85; // Sudah tidak dipakai

  return (
  <Box sx={{ minHeight: '100vh', width: '100%', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif', color: isDarkMode ? '#fff' : '#333', backgroundImage: isDarkMode ? "url('/Frame211332.png')" : "url('/Frame211332-light.png')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundColor: isDarkMode ? '#090d1f' : '#f8f8f8', overflowX: 'hidden' }}>
    {/* Tidak ada header/topbar putih di sini. Jika masih muncul, cek file layout utama seperti App.js atau MainLayout.js */}

    {/* Konten utama */}
    <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: isDarkMode ? 'transparent' : '#f8f8f8' }}>
      {/* Overlay gradient agar teks tetap jelas - dihapus agar menyatu dengan layout */}

      {/* Konten dashboard */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 2, md: 3 }, pt: 5, position: 'relative', zIndex: 1 }}>



      {/* Search & Add New Document - PINDAH KE ATAS */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
        <TextField
  InputLabelProps={{ style: { color: isDarkMode ? '#b5eaff' : '#757575', fontWeight: 600 } }}
  InputProps={{ 
    style: { color: isDarkMode ? '#fff' : '#333', background: isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(255,255,255,0.9)', borderRadius: 2 },
    startAdornment: (
      <Box component="span" sx={{ color: isDarkMode ? '#b5eaff' : '#757575', mr: 1, fontSize: 14, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 4 }}>🔍</span>
      </Box>
    )
  }}
          variant="outlined"
          size="small"
          placeholder="Cari Dokumen (Nama/ID)"
          value={searchTerm}
          onChange={(e) => {
            console.log('Search term changed:', e.target.value);
            setSearchTerm(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              console.log('Search submitted:', searchTerm);
              // Refresh the filtered documents
              const filtered = documents.filter(doc => {
                if (!searchTerm || searchTerm.trim() === '') return true;
                const search = searchTerm.toLowerCase().trim();
                return (
                  (doc.namaProyek || doc.title || '').toString().toLowerCase().includes(search) ||
                  (doc._id || '').toString().toLowerCase().includes(search) ||
                  (doc.bp !== null && doc.bp !== undefined ? doc.bp.toString().toLowerCase() : '').includes(search) ||
                  (doc.mutuBahan || '').toString().toLowerCase().includes(search) ||
                  (doc.tipeBahan || '').toString().toLowerCase().includes(search)
                );
              });
              console.log('Filtered documents:', filtered.length);
            }
          }}
          sx={{ bgcolor: isDarkMode ? 'rgba(20,32,54,0.88)' : 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#ddd'}`, input: { color: isDarkMode ? '#fff' : '#333' }, width: '100%', flex: 1, '& .MuiOutlinedInput-notchedOutline': { borderColor: isDarkMode ? '#41e3ff' : '#ddd' }, '& input::placeholder': { color: isDarkMode ? '#bdbdbd' : '#757575', opacity: 1 }, mb: { xs: 1, sm: 0 } }}
        />
        {(userRole === 'admin' || userRole === 'staff') && (
          <Button
            variant="contained"
            sx={{ 
              bgcolor: isDarkMode ? muiTheme.palette.primary.main : '#1976d2', 
              color: isDarkMode ? '#111a2b' : '#ffffff', 
              fontWeight: 700, 
              borderRadius: 2, 
              boxShadow: 'none', 
              '&:hover': { 
                bgcolor: isDarkMode ? '#1ec6e6' : '#1976d2' 
              }, 
              width: { xs: '100%', sm: 'auto' }, 
              minWidth: 140, 
              mt: { xs: 0, sm: 0 } 
            }}
            onClick={() => setAddDialog(true)}
          >
            Tambah Dokumen Baru
          </Button>
        )}
      </Box>

      {/* Statistik dan Pie Chart */}
      <Box sx={{ width: '100%', mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Statistik Dokumen */}
        <Paper elevation={3} sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 30%' }, 
          p: 2, 
          borderRadius: 2,
          border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
          bgcolor: isDarkMode ? 'rgba(65,227,255,0.15)' : '#ffffff',
          boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          color: isDarkMode ? '#fff' : '#333',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#41e3ff' : '#1976d2', mb: 2 }}>
            Statistik Dokumen
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25,118,210,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Dokumen:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{totalDocs}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25,118,210,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Menunggu:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{statusCounts['pending'] || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25,118,210,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Ditinjau:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{statusCounts['review'] || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25,118,210,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Dalam Proses:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{statusCounts['in_progress'] || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25,118,210,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Selesai:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{statusCounts['completed'] || 0}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Pie Chart */}
        <Paper elevation={3} sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 65%' }, 
          p: 2, 
          borderRadius: 2,
          border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
          bgcolor: isDarkMode ? 'rgba(65,227,255,0.15)' : '#ffffff',
          boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)',
          color: isDarkMode ? '#fff' : '#333',
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: isDarkMode ? '#41e3ff' : '#1976d2', 
            mb: 3,
            textAlign: 'left',
          }}>
            Distribusi Status Dokumen
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 180, 
            width: '100%',
            position: 'relative',
          }}>
            <Box sx={{ 
              width: '60%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: '85%', md: '75%' }, 
                maxWidth: 180,
                mx: 'auto'
              }}>
                <Pie 
                  data={pieData} 
                  options={{
                    ...pieOptions,
                    plugins: {
                      ...pieOptions.plugins,
                      legend: {
                        display: false
                      }
                    },
                    maintainAspectRatio: true
                  }} 
                />
              </Box>
            </Box>
            <Box sx={{ 
              width: '40%', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              pl: { xs: 1, sm: 2, md: 3 }
            }}>
              {pieData.labels.map((label, index) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box 
                    sx={{ 
                      width: 14, 
                      height: 14, 
                      borderRadius: '2px', 
                      bgcolor: pieData.datasets[0].backgroundColor[index],
                      mr: 1.5
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: isDarkMode ? '#fff' : '#333' }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Filter Status */}
      <Box sx={{ 
        width: '100%', 
        mb: 3, 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 1,
        p: 0,
      }}>
        <Button
          variant={statusFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('all')}
          sx={{
            borderRadius: 2,
            px: 2,
            bgcolor: statusFilter === 'all' ? (isDarkMode ? '#41e3ff' : '#1976d2') : 'transparent',
            color: statusFilter === 'all' ? (isDarkMode ? '#111a2b' : '#fff') : (isDarkMode ? '#41e3ff' : '#1976d2'),
            border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            '&:hover': {
              bgcolor: statusFilter === 'all' ? (isDarkMode ? '#1ec6e6' : '#1565c0') : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)')
            },
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          Semua
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('pending')}
          sx={{
            borderRadius: 2,
            px: 2,
            bgcolor: statusFilter === 'pending' ? (isDarkMode ? '#41e3ff' : '#1976d2') : 'transparent',
            color: statusFilter === 'pending' ? (isDarkMode ? '#111a2b' : '#fff') : (isDarkMode ? '#41e3ff' : '#1976d2'),
            border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            '&:hover': {
              bgcolor: statusFilter === 'pending' ? (isDarkMode ? '#1ec6e6' : '#1565c0') : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)')
            },
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          Menunggu
        </Button>
        <Button
          variant={statusFilter === 'review' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('review')}
          sx={{
            borderRadius: 2,
            px: 2,
            bgcolor: statusFilter === 'review' ? (isDarkMode ? '#41e3ff' : '#1976d2') : 'transparent',
            color: statusFilter === 'review' ? (isDarkMode ? '#111a2b' : '#fff') : (isDarkMode ? '#41e3ff' : '#1976d2'),
            border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            '&:hover': {
              bgcolor: statusFilter === 'review' ? (isDarkMode ? '#1ec6e6' : '#1565c0') : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)')
            },
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          Ditinjau
        </Button>
        <Button
          variant={statusFilter === 'in_progress' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('in_progress')}
          sx={{
            borderRadius: 2,
            px: 2,
            bgcolor: statusFilter === 'in_progress' ? (isDarkMode ? '#41e3ff' : '#1976d2') : 'transparent',
            color: statusFilter === 'in_progress' ? (isDarkMode ? '#111a2b' : '#fff') : (isDarkMode ? '#41e3ff' : '#1976d2'),
            border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            '&:hover': {
              bgcolor: statusFilter === 'in_progress' ? (isDarkMode ? '#1ec6e6' : '#1565c0') : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)')
            },
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          Dalam Proses
        </Button>
        <Button
          variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
          onClick={() => setStatusFilter('completed')}
          sx={{
            borderRadius: 2,
            px: 2,
            bgcolor: statusFilter === 'completed' ? (isDarkMode ? '#41e3ff' : '#1976d2') : 'transparent',
            color: statusFilter === 'completed' ? (isDarkMode ? '#111a2b' : '#fff') : (isDarkMode ? '#41e3ff' : '#1976d2'),
            border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            '&:hover': {
              bgcolor: statusFilter === 'completed' ? (isDarkMode ? '#1ec6e6' : '#1565c0') : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)')
            },
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          Selesai
        </Button>
      </Box>

      {/* Grid kartu dokumen dan placeholder, maksimal 3 per baris (3x3 di desktop), styling mirip gambar, RESPONSIF */}
      <Box id="card-grid" sx={{ width: '100%', mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 1.5, sm: 2, md: 4 } }}>
        {filteredDocuments.length > 0 ? (
          currentCards.map((doc, idx) => (
          <Box key={doc._id} sx={{ minWidth: { xs: 0, sm: 250, md: 320 }, maxWidth: '100%' }}>
            <Paper elevation={3} sx={{
              minHeight: { xs: 160, md: 220 },
              p: { xs: 1.5, sm: 2, md: 2.5 },
              border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
              borderRadius: 2,
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.08)' : '0 6px 16px rgba(0,0,0,0.15)' },
              background: isDarkMode ? 'rgba(65,227,255,0.15)' : '#ffffff',
              backdropFilter: 'blur(8px)',
              color: isDarkMode ? '#fff' : '#333',
            }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: { xs: 11, md: 13 }, fontWeight: 500, color: isDarkMode ? '#b5eaff' : '#1976d2' }}>#{doc.placeholderId || doc._id}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, color: isDarkMode ? '#fff' : '#333' }}>{doc.namaProyek || doc.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'space-between' }}>
                <Box sx={{ 
                  px: 1.2, 
                  py: 0.2, 
                  bgcolor: statusColors[doc.status] || '#e7f6fd', 
                  color: '#222', 
                  borderRadius: 1, 
                  fontWeight: 700, 
                  fontSize: 13, 
                  minWidth: 86, 
                  textAlign: 'center',
                  boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {statusLabels[doc.status] || doc.status}
                </Box>
                {/* Tombol edit/hapus dipindahkan ke sini */}
                {userRole === 'admin' || userRole === 'staff' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Tampilkan tombol edit hanya jika status bukan completed */}
                    {doc.status !== 'completed' && (
                      <Button 
                        onClick={() => handleEdit(doc)}
                        size="small"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: '2px 6px', 
                          borderRadius: 1,
                          minWidth: 'auto',
                          bgcolor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                          border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(25, 118, 210, 0.3)',
                          '&:hover': { 
                            bgcolor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(25, 118, 210, 0.15)',
                            border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(25, 118, 210, 0.5)'
                          }
                        }}
                      >
                        <span role="img" aria-label="edit" style={{ fontSize: 12, color: isDarkMode ? '#3b82f6' : '#1976d2', marginRight: 2, fontWeight: 'bold' }}>✎</span>
                        <Typography sx={{ fontSize: 10, color: isDarkMode ? '#3b82f6' : '#1976d2', fontWeight: 700 }}>Edit</Typography>
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDelete(doc)}
                      size="small"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: '2px 6px', 
                        borderRadius: 1,
                        minWidth: 'auto',
                        bgcolor: isDarkMode ? 'rgba(231, 76, 60, 0.1)' : 'rgba(220, 53, 69, 0.08)',
                        border: isDarkMode ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid rgba(220, 53, 69, 0.3)',
                        '&:hover': { 
                          bgcolor: isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(220, 53, 69, 0.15)',
                          border: isDarkMode ? '1px solid rgba(231, 76, 60, 0.5)' : '1px solid rgba(220, 53, 69, 0.5)'
                        }
                      }}
                    >
                      <span role="img" aria-label="delete" style={{ fontSize: 12, color: isDarkMode ? '#e74c3c' : '#dc3545', marginRight: 2, fontWeight: 'bold' }}>🗑️</span>
                      <Typography sx={{ fontSize: 10, color: isDarkMode ? '#e74c3c' : '#dc3545', fontWeight: 700 }}>Hapus</Typography>
                    </Button>
                  </Box>
                ) : null}
              </Box>
              
              {/* Tampilkan Tipe Pengujian */}
              <Box sx={{ 
                fontSize: 14, 
                mb: 0.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                color: isDarkMode ? '#b5eaff' : '#1976d2',
                p: 0.5,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
              }}>
                <span style={{ fontWeight: 500 }}>Tipe Pengujian:</span> 
                <b style={{ color: isDarkMode ? '#fff' : '#333' }}>
                  {doc.tipePengujian || 
                    (doc.mutuBahan && doc.mutuBahan.startsWith('T') ? 'Besi' : 
                     doc.mutuBahan && doc.mutuBahan.startsWith('K') ? 'Beton' : '-')}
                </b>
              </Box>
              {(() => {
  // Determine tipePengujian based on mutuBahan if not set
  const isBesi = doc.tipePengujian === 'Besi' || (doc.mutuBahan && doc.mutuBahan.startsWith('T'));
  
  return isBesi ? (
    <Box sx={{ 
      fontSize: 14, 
      mb: 0.5, 
      display: 'flex', 
      justifyContent: 'space-between', 
      color: isDarkMode ? '#b5eaff' : '#1976d2',
      p: 0.5,
      borderRadius: 1,
      bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
    }}>
      <span style={{ fontWeight: 500 }}>Panjang Ulur (mm):</span> 
      <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
        {doc.bp || '-'}
      </b>
    </Box>
  ) : (
    <Box sx={{ 
      fontSize: 14, 
      mb: 0.5, 
      display: 'flex', 
      justifyContent: 'space-between', 
      color: isDarkMode ? '#b5eaff' : '#1976d2',
      p: 0.5,
      borderRadius: 1,
      bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
    }}>
      <span style={{ fontWeight: 500 }}>BP (Kg):</span> 
      <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
        {doc.bp || '-'}
      </b>
    </Box>
  );
})()}
              {/* Tampilkan Mutu Bahan - diletakkan di atas Tipe Bahan */}
              <Box sx={{ 
                fontSize: 14, 
                mb: 1, 
                mt: 0.8,
                display: 'flex', 
                justifyContent: 'space-between', 
                color: isDarkMode ? '#b5eaff' : '#1976d2',
                p: 0.6,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
              }}>
                <span style={{ fontWeight: 500 }}>Mutu Bahan:</span> 
                <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
                  {doc.mutuBahan || '-'}
                </b>
              </Box>
              
              {/* Tampilkan Tipe Bahan dengan styling yang diselaraskan */}
              {(() => {
  // Determine tipePengujian based on mutuBahan if not set
  const isBesi = doc.tipePengujian === 'Besi' || (doc.mutuBahan && doc.mutuBahan.startsWith('T'));
  
  return isBesi ? (
    <Box sx={{ 
      fontSize: 14, 
      mb: 1, 
      mt: 0.8,
      display: 'flex', 
      justifyContent: 'space-between', 
      color: isDarkMode ? '#b5eaff' : '#1976d2',
      p: 0.6,
      borderRadius: 1,
      bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
    }}>
      <span style={{ fontWeight: 500 }}>Tipe Bahan:</span> 
      <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
        {doc.tipeBahan === 'Silinder' ? 'BJTS (Ulir)' : doc.tipeBahan === 'Kubus' ? 'BJTP (Polos)' : (doc.tipeBahan || '-')}
      </b>
    </Box>
  ) : (
    <Box sx={{ 
      fontSize: 14, 
      mb: 1, 
      mt: 0.8,
      display: 'flex', 
      justifyContent: 'space-between', 
      color: isDarkMode ? '#b5eaff' : '#1976d2',
      p: 0.6,
      borderRadius: 1,
      bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
    }}>
      <span style={{ fontWeight: 500 }}>Tipe Bahan:</span> 
      <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
        {doc.tipeBahan ? doc.tipeBahan.charAt(0).toUpperCase() + doc.tipeBahan.slice(1).toLowerCase() : '-'}
      </b>
    </Box>
  );
})()}
{/* Show description for tipePengujian in card */}
{(() => {
  // Determine tipePengujian based on mutuBahan if not set
  const derivedTipePengujian = doc.tipePengujian || 
    (doc.mutuBahan && doc.mutuBahan.startsWith('T') ? 'Besi' : 
     doc.mutuBahan && doc.mutuBahan.startsWith('K') ? 'Beton' : null);
  
  // Only show description for Beton, not for Besi
  return derivedTipePengujian === 'Beton' && tipePengujianDescriptions[derivedTipePengujian] && (
  <Box sx={{ fontSize: 13, color: isDarkMode ? '#b5eaff' : '#1976d2', fontStyle: 'italic', mb: 0.5 }}>
    {tipePengujianDescriptions[derivedTipePengujian]}
  </Box>
  );
})()}
              <Box sx={{ 
                fontSize: 14, 
                mb: 1, 
                mt: 0.8,
                display: 'flex', 
                justifyContent: 'space-between', 
                color: isDarkMode ? '#b5eaff' : '#1976d2',
                p: 0.6,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(25, 118, 210, 0.05)'
              }}>
                <span style={{ fontWeight: 500 }}>Submission:</span> 
                <b style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25, 118, 210, 0.1)', padding: '0 6px', borderRadius: 4 }}>
                  {formatDate(doc.submissionDate)}
                </b>
              </Box>
              {/* Informasi user sudah ditampilkan di bagian Customer, jadi tidak perlu ditampilkan di sini */}

              {/* Tampilkan nama customer dengan highlight yang lebih menonjol */}
              <Box sx={{ 
                fontSize: 14, 
                mb: 1.5, 
                mt: 1, 
                display: 'flex', 
                justifyContent: 'space-between', 
                color: isDarkMode ? '#b5eaff' : '#1976d2',
                p: 0.8,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(25, 118, 210, 0.08)',
                border: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25, 118, 210, 0.2)'}`,
                boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontWeight: 600 }}>Customer:</span> 
                <b style={{ 
                  color: isDarkMode ? '#fff' : '#333', 
                  backgroundColor: isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25, 118, 210, 0.15)', 
                  padding: '2px 8px', 
                  borderRadius: 4,
                  fontWeight: 700,
                  letterSpacing: '0.01em'
                }}>
                  {doc.customer || doc.targetUser?.fullname || '-'}
                </b>
              </Box>

              {/* Tampilkan keterangan status dokumen */}
              {doc.status === 'completed' ? (
                <Typography sx={{ 
                  color: isDarkMode ? '#8c8c8c' : '#666', 
                  fontSize: 13, 
                  mt: 0,
                  fontWeight: 500,
                  p: 0.5,
                  borderRadius: 1,
                  bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  <span style={{ verticalAlign: 'middle', marginRight: 4 }}>📄</span>
                  Selesai Pada <span style={{ fontWeight: 'bold', color: isDarkMode ? '#b5eaff' : '#1976d2', marginLeft: 4 }}>{formatDate(doc.lastModified)}</span>
                </Typography>
              ) : (
                <Typography sx={{ 
                  color: isDarkMode ? '#8c8c8c' : '#666', 
                  fontSize: 13, 
                  mt: 0,
                  fontWeight: 500,
                  p: 0.5,
                  borderRadius: 1,
                  bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  <span style={{ verticalAlign: 'middle', marginRight: 4 }}>⏳</span>
                  <span>Menunggu Selesai</span>
                </Typography>
              )}
            </Paper>
          </Box>
        )))
        : (
          <Box sx={{ gridColumn: '1 / -1', p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', mb: 2 }}>
              Tidak ada dokumen yang ditemukan
            </Typography>
            <Typography variant="body1" sx={{ color: isDarkMode ? '#fff' : '#333' }}>
              Coba ubah filter status atau kata kunci pencarian
            </Typography>
          </Box>
        )}
      </Box>

      {/* Pagination Navigation */}
      {filteredDocuments.length > cardsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mt: 2, 
          mb: 4,
          gap: 1
        }}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ 
              minWidth: 40, 
              height: 40,
              borderRadius: 2,
              bgcolor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25,118,210,0.2)'}`,
              color: isDarkMode ? '#41e3ff' : '#1976d2',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25,118,210,0.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
                color: isDarkMode ? 'rgba(65,227,255,0.5)' : 'rgba(25,118,210,0.5)',
              }
            }}
          >
            <span style={{ fontSize: 20 }}>«</span>
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5 
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                sx={{ 
                  minWidth: 40, 
                  height: 40,
                  borderRadius: 2,
                  bgcolor: currentPage === page 
                    ? (isDarkMode ? '#41e3ff' : '#1976d2') 
                    : (isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.05)'),
                  border: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25,118,210,0.2)'}`,
                  color: currentPage === page 
                    ? (isDarkMode ? '#111a2b' : '#fff') 
                    : (isDarkMode ? '#41e3ff' : '#1976d2'),
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: currentPage === page 
                      ? (isDarkMode ? '#1ec6e6' : '#1565c0') 
                      : (isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25,118,210,0.1)'),
                  }
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ 
              minWidth: 40, 
              height: 40,
              borderRadius: 2,
              bgcolor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25,118,210,0.2)'}`,
              color: isDarkMode ? '#41e3ff' : '#1976d2',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25,118,210,0.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
                color: isDarkMode ? 'rgba(65,227,255,0.5)' : 'rgba(25,118,210,0.5)',
              }
            }}
          >
            <span style={{ fontSize: 20 }}>»</span>
          </Button>
        </Box>
      )}

      {/* Dialogs ... */}
      <Dialog 
        key={`edit-dialog-${selectedDocument?._id}-${newMutuBahan}-${newTipeBahan}-${newStatus}`} 
        open={editDialog} 
        onClose={() => setEditDialog(false)} 
        maxWidth="md" 
        fullWidth
  PaperProps={{
    sx: {
      background: isDarkMode ? 'rgba(20,32,54,0.92)' : 'rgba(255,255,255,0.95)',
      color: isDarkMode ? '#fff' : '#333',
      borderRadius: 3,
      boxShadow: isDarkMode ? '0 8px 32px 0 rgba(65,227,255,0.10)' : '0 8px 32px 0 rgba(0,0,0,0.10)',
      border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>
        <DialogTitle sx={{ color: isDarkMode ? '#41e3ff' : '#1976d2', fontWeight: 700, fontSize: 22, pb: 2, fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
          Edit Dokumen
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth sx={{ bgcolor: isDarkMode ? 'rgba(22, 35, 54, 0.8)' : 'rgba(255, 255, 255, 0.95)', borderRadius: 2 }}>
              <InputLabel sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 }}>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{
                  color: isDarkMode ? '#fff' : '#333',
                  background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontFamily: 'Open Sans',
                  '& .MuiSelect-select': {
                    color: isDarkMode ? '#fff' : '#333',
                    background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontFamily: 'Open Sans',
                  },
                  '& fieldset': {
                    borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: isDarkMode ? '#162336' : '#ffffff',
                      color: isDarkMode ? '#fff' : '#333',
                      borderRadius: 2,
                    },
                  },
                }}
              >
                <MenuItem value="pending" sx={{ 
                  color: isDarkMode ? '#fff' : '#333', 
                  backgroundColor: 'transparent', 
                  '&.Mui-selected': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  }, 
                  '&:hover': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  } 
                }}>MENUNGGU</MenuItem>
                <MenuItem value="review" sx={{ 
                  color: isDarkMode ? '#fff' : '#333', 
                  backgroundColor: 'transparent', 
                  '&.Mui-selected': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  }, 
                  '&:hover': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  } 
                }}>DITINJAU</MenuItem>
                <MenuItem value="in_progress" sx={{ 
                  color: isDarkMode ? '#fff' : '#333', 
                  backgroundColor: 'transparent', 
                  '&.Mui-selected': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  }, 
                  '&:hover': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  } 
                }}>DALAM PROSES</MenuItem>
                <MenuItem value="completed" sx={{ 
                  color: isDarkMode ? '#fff' : '#333', 
                  backgroundColor: 'transparent', 
                  '&.Mui-selected': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  }, 
                  '&:hover': { 
                    backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                    color: isDarkMode ? '#41e3ff' : '#1976d2' 
                  } 
                }}>SELESAI</MenuItem>
              </Select>
            </FormControl>
            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subnamaProyek1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Pengujian
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Dropdown Tipe Pengujian */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mb: 2, bgcolor: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)', borderRadius: 2 }}>
                    <InputLabel sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 }}>Tipe Pengujian</InputLabel>
                    <Select
                      value={newDocTipePengujian}
                      label="Tipe Pengujian"
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewDocTipePengujian(value);
                        
                        // Reset fields when changing test type
                        if (value === 'Besi') {
                          // For Besi, set default values for its specific fields
                          setNewMutuBahan('');
                          setNewTipeBahan('');
                        } else if (value === 'Beton') {
                          // For Beton, reset to default values for concrete
                          setNewMutuBahan('');
                          setNewTipeBahan('');
                        } else {
                          // For None or any other value, clear all fields
                          setNewMutuBahan('');
                          setNewTipeBahan('');
                        }
                      }}
                      sx={{
                        color: isDarkMode ? '#fff' : '#333',
                        background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontFamily: 'Open Sans',
                        '& .MuiSelect-select': {
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontFamily: 'Open Sans',
                        },
                        '& fieldset': {
                          borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background: isDarkMode ? '#162336' : '#ffffff',
                            color: isDarkMode ? '#fff' : '#333',
                            borderRadius: 2,
                          },
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>None</MenuItem>
                      <MenuItem value="Beton" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Beton</MenuItem>
                      <MenuItem value="Besi" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Besi</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Campo BP (Kg) */}
                  <TextField
                    InputLabelProps={{ style: { color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 } }}
                    InputProps={{
                      style: {
                        color: isDarkMode ? '#fff' : '#333',
                        background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                        borderRadius: 8,
                        border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
                        fontFamily: 'Open Sans',
                        fontWeight: 600,
                        paddingLeft: 8,
                      },
                    }}
                    margin="dense"
                    label={newDocTipePengujian === 'Besi' ? "Panjang Ulur (mm)" : "BP (Kg)"}
                    type="number"
                    inputProps={{ 
                      step: 'any', 
                      style: { 
                        color: isDarkMode ? '#fff' : '#333', 
                        background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)' 
                      }, 
                      autoComplete: 'off' 
                    }}
                    value={newBP}
                    onChange={e => setNewBP(e.target.value)}
                    autoComplete="off"
                    sx={{
                      flexGrow: 1,
                      minWidth: '200px',
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: '#162336',
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        background: '#162336',
                        borderRadius: '8px',
                        border: '1.5px solid #41e3ff',
                        fontFamily: 'Open Sans',
                        fontWeight: 600,
                        paddingLeft: 1,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                      },
                      '& input': {
                        color: isDarkMode ? '#fff' : '#333',
                        background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                        borderRadius: '8px',
                        fontFamily: 'Open Sans',
                        fontWeight: 600,
                        '-webkit-text-fill-color': isDarkMode ? '#fff' : '#333',
                        boxShadow: isDarkMode ? '0 0 0 1000px #162336 inset' : '0 0 0 1000px rgba(255,255,255,0.9) inset',
                      },
                      '& input::placeholder': {
                        color: isDarkMode ? '#b5eaff' : '#757575',
                        opacity: 1,
                      },
                    }}
                  />
                  
                  {/* Campo Mutu Bahan */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mb: 2, bgcolor: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)', borderRadius: 2 }} required>
                    <InputLabel sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 }}>Mutu Bahan</InputLabel>
                    <Select
                      value={newMutuBahan || ''}
                      label="Mutu Bahan"
                      onChange={e => {
                        console.log('Mutu Bahan diubah ke:', e.target.value);
                        setNewMutuBahan(e.target.value);
                        
                        // Detectar tipo de pengujian basado en Mutu Bahan
                        if (e.target.value.startsWith('T')) {
                          setNewDocTipePengujian('Besi');
                        } else if (e.target.value.startsWith('K')) {
                          setNewDocTipePengujian('Beton');
                        }
                      }}
                      required
                      sx={{
                        color: isDarkMode ? '#fff' : '#333',
                        background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontFamily: 'Open Sans',
                        '& .MuiSelect-select': {
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontFamily: 'Open Sans',
                        },
                        '& fieldset': {
                          borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background: isDarkMode ? '#162336' : '#ffffff',
                            color: isDarkMode ? '#fff' : '#333',
                            borderRadius: 2,
                          },
                        },
                      }}
                    >
                      {newDocTipePengujian === 'Besi' ? (
                        <>
                          <MenuItem value="T 280" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>T 280</MenuItem>
                          <MenuItem value="T 420" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>T 420</MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem value="K 125" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 125</MenuItem>
                          <MenuItem value="K 150" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 150</MenuItem>
                          <MenuItem value="K 175" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 175</MenuItem>
                          <MenuItem value="K 200" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 200</MenuItem>
                          <MenuItem value="K 225" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 225</MenuItem>
                          <MenuItem value="K 250" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 250</MenuItem>
                          <MenuItem value="K 300" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 300</MenuItem>
                          <MenuItem value="K 350" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 350</MenuItem>
                          <MenuItem value="K 400" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 400</MenuItem>
                          <MenuItem value="K 450" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 450</MenuItem>
                          <MenuItem value="K 500" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 500</MenuItem>
                          <MenuItem value="K 600" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>K 600</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                  
                  {/* Campo Tipe Bahan (dropdown) */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mt: 1, mb: 2, bgcolor: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)', borderRadius: 2 }}>
                    <InputLabel sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 }}>Tipe Bahan</InputLabel>
                      <Select
                        value={newTipeBahan || ''}
                        label="Tipe Bahan"
                        onChange={e => {
                          console.log('Tipe Bahan diubah ke:', e.target.value);
                          setNewTipeBahan(e.target.value);
                          
                          // Detectar y ajustar tipo de pengujian basado en Tipe Bahan
                          if (e.target.value === 'BJTS (Ulir)' || e.target.value === 'BJTP (Polos)') {
                            setNewDocTipePengujian('Besi');
                          } else if (e.target.value === 'Silinder' || e.target.value === 'Kubus' || 
                                   e.target.value === 'Balok' || e.target.value === 'Paving' || 
                                   e.target.value === 'Scoup') {
                            setNewDocTipePengujian('Beton');
                          }
                        }}
                        sx={{
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontFamily: 'Open Sans',
                          '& .MuiSelect-select': {
                            color: isDarkMode ? '#fff' : '#333',
                            background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontFamily: 'Open Sans',
                          },
                          '& fieldset': {
                            borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              background: isDarkMode ? '#162336' : '#ffffff',
                              color: isDarkMode ? '#fff' : '#333',
                              borderRadius: 2,
                            },
                          },
                        }}
                      >
                      {newDocTipePengujian === 'Besi' ? (
                        <>
                          <MenuItem value="BJTS (Ulir)" sx={{ 
                            color: isDarkMode ? '#fff' : '#333', 
                            backgroundColor: 'transparent', 
                            '&.Mui-selected': { 
                              backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                              color: isDarkMode ? '#41e3ff' : '#1976d2' 
                            }, 
                            '&:hover': { 
                              backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                              color: isDarkMode ? '#41e3ff' : '#1976d2' 
                            } 
                          }}>BJTS (Ulir)</MenuItem>
                          <MenuItem value="BJTP (Polos)" sx={{ 
                            color: isDarkMode ? '#fff' : '#333', 
                            backgroundColor: 'transparent', 
                            '&.Mui-selected': { 
                              backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                              color: isDarkMode ? '#41e3ff' : '#1976d2' 
                            }, 
                            '&:hover': { 
                              backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', 
                              color: isDarkMode ? '#41e3ff' : '#1976d2' 
                            } 
                          }}>BJTP (Polos)</MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem value="" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}><em>None</em></MenuItem>
                          <MenuItem value="Silinder" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Silinder</MenuItem>
                          <MenuItem value="Kubus" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Kubus</MenuItem>
                          <MenuItem value="Balok" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Balok</MenuItem>
                          <MenuItem value="Paving" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Paving</MenuItem>
                          <MenuItem value="Scoup" sx={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' }, '&:hover': { backgroundColor: isDarkMode ? '#22304d' : '#e3f2fd', color: isDarkMode ? '#41e3ff' : '#1976d2' } }}>Scoup</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Autocomplete
                    options={userList}
                    getOptionLabel={(option) => option.fullname || ''}
                    value={userList.find(user => user._id === targetUser) || null}
                    onChange={(_, newValue) => setTargetUser(newValue?._id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tujuan Pengguna"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{
                          style: {
                            color: isDarkMode ? '#b5eaff' : '#1565c0',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        color: isDarkMode ? '#fff' : '#333',
                        background: isDarkMode ? 'rgba(22, 35, 54, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDarkMode ? 'rgba(65,227,255,0.5)' : 'rgba(25, 118, 210, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                          boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.2)' : '0 0 0 2px rgba(25, 118, 210, 0.2)',
                        }
                      },
                      '& .MuiAutocomplete-input': {
                        color: isDarkMode ? '#fff' : '#1a1a1a',
                        '&::placeholder': {
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                          opacity: 1,
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? '#b5eaff' : '#1565c0',
                        '&.Mui-focused': {
                          color: isDarkMode ? '#41e3ff' : '#1976d2'
                        }
                      },
                      '& .MuiAutocomplete-listbox': {
                        backgroundColor: isDarkMode ? '#142032' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#1a1a1a',
                        '& .MuiAutocomplete-option': {
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                          },
                          '&[data-focus="true"]': {
                            backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.2)' : 'rgba(25, 118, 210, 0.2)'
                          },
                          '&[aria-selected="true"]': {
                            backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.15)' : 'rgba(25, 118, 210, 0.15)'
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setEditDialog(false)}
                variant="outlined"
                sx={{ 
                  color: isDarkMode ? '#41e3ff' : '#1976d2', 
                  borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                  '&:hover': { borderColor: isDarkMode ? '#41e3ff' : '#1976d2', background: isDarkMode ? 'rgba(65,227,255,0.08)' : 'rgba(25,118,210,0.08)' }
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleDocumentUpdate} 
                variant="contained"
                sx={{
                  ml: 2,
                  background: isDarkMode ? 'linear-gradient(90deg, #41e3ff 0%, #1ec6e6 100%)' : 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                  color: isDarkMode ? '#0a1929' : '#ffffff',
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: isDarkMode ? '0 2px 8px 0 rgba(65,227,255,0.12)' : '0 2px 8px 0 rgba(25,118,210,0.2)',
                  '&:hover': { background: isDarkMode ? '#65e7ff' : '#2196f3' },
                  '&.Mui-disabled': { background: isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25,118,210,0.3)', color: isDarkMode ? '#193549' : '#e0e0e0' }
                }}
              >
                Perbarui
              </Button>
            </DialogActions>
          </Dialog>


      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth
  PaperProps={{
    sx: {
      background: isDarkMode ? 'rgba(20,32,54,0.92)' : 'rgba(255,255,255,0.95)',
      color: isDarkMode ? '#fff' : '#333',
      borderRadius: 3,
      boxShadow: isDarkMode ? '0 8px 32px 0 rgba(65,227,255,0.10)' : '0 8px 32px 0 rgba(0,0,0,0.10)',
      border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>

        <DialogTitle sx={{ 
  color: isDarkMode ? '#41e3ff' : '#1565c0', 
  fontWeight: 700, 
  fontSize: 24, 
  pb: 2, 
  pt: 1,
  fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
  borderBottom: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25,118,210,0.2)'}`,
  mb: 2,
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    mr: 1.5,
    fontSize: '1.5rem'
  }
}}>
  <DescriptionIcon />
  Tambah Dokumen Baru
</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
  autoFocus
  margin="dense"
  label="Nama Proyek"
  type="text"
  fullWidth
  value={newNamaProyek}
  onChange={e => setNewNamaProyek(e.target.value)}
  required
  InputLabelProps={{ style: { color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 } }}
  InputProps={{ style: { color: isDarkMode ? '#fff' : '#333', background: isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(25, 118, 210, 0.05)', borderRadius: 2 } }}
/>

            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subnamaProyek1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Pengujian
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Campo Tipe Pengujian (dropdown nativo) */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      color: isDarkMode ? '#b5eaff' : '#1565c0', 
                      mb: 1.5, 
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      Tipe Pengujian
                    </Typography>
                    <Box
                      component="select"
                      value={newDocTipePengujian}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewDocTipePengujian(value);
                        
                        // Reset related fields when tipePengujian changes
                        setNewDocKodeBahan('');
                        setNewDocTipeBahan('');
                      }}
                      sx={getDropdownStyles(isDarkMode)}
                    >
                      <option value="" disabled style={{color: isDarkMode ? '#41e3ff' : '#1976d2'}}>Pilih Tipe Pengujian</option>
                      <option value="Beton">Beton</option>
                      <option value="Besi">Besi</option>
                    </Box>
                    {/* Show description for selected tipePengujian */}
                    {newDocTipePengujian && tipePengujianDescriptions[newDocTipePengujian] && (
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', mt: 1, mb: 1, fontStyle: 'italic' }}>
                        {tipePengujianDescriptions[newDocTipePengujian]}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      color: isDarkMode ? '#b5eaff' : '#1565c0', 
                      mb: 1.5, 
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      {newDocTipePengujian === 'Besi' ? "Panjang Ulur (mm)" : "BP (Kg)"}
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      inputProps={{ 
                        step: 'any', 
                        style: { color: isDarkMode ? '#fff' : '#333' }, 
                        autoComplete: 'off' 
                      }}
                      value={newDocBP}
                      onChange={e => setNewDocBP(e.target.value)}
                      required
                      autoComplete="off"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? '#0a1929' : 'rgba(255,255,255,0.9)',
                          borderRadius: '4px',
                          border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
                          fontFamily: 'inherit',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            background: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.05)',
                          },
                          '&.Mui-focused': {
                            background: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.08)',
                            boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.5)' : '0 0 0 2px rgba(25,118,210,0.3)',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
                        },
                        '& input': {
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? '#162336' : 'rgba(255,255,255,0.9)',
                          borderRadius: '8px',
                          fontFamily: 'Open Sans',
                          fontWeight: 600,
                          '-webkit-text-fill-color': isDarkMode ? '#fff' : '#333',
                          boxShadow: isDarkMode ? '0 0 0 1000px #162336 inset' : '0 0 0 1000px rgba(255,255,255,0.9) inset',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', mb: 1, fontWeight: 600 }}>Mutu Bahan</Typography>
                    <Box 
                      component="select"
                      value={newDocKodeBahan}
                      onChange={(e) => setNewDocKodeBahan(e.target.value)}
                      sx={getDropdownStyles(isDarkMode)}
                    >
                      <option value="" disabled style={{color: isDarkMode ? '#41e3ff' : '#1976d2'}}>Pilih Mutu Bahan</option>
                      {/* Tampilkan data dari API jika ada */}
                      {mutuBahanOptions.length > 0 && mutuBahanOptions
                        .filter(option => option.testType === newDocTipePengujian)
                        .map(option => (
                          <option key={option._id} value={option.value}>
                            {option.value}
                          </option>
                        ))
                      }
                      {/* Tampilkan opsi default jika tidak ada data dari API */}
                      {(!mutuBahanOptions.length || !mutuBahanOptions.filter(option => option.testType === newDocTipePengujian).length) && (
                        <>
                          {newDocTipePengujian === 'Besi' && (
                            <>
                              <option value="T 280">T 280</option>
                              <option value="T 420">T 420</option>
                            </>
                          )}
                          {newDocTipePengujian === 'Beton' && (
                            <>
                              <option value="K 225">K 225</option>
                              <option value="K 250">K 250</option>
                              <option value="K 300">K 300</option>
                              <option value="K 350">K 350</option>
                              <option value="K 400">K 400</option>
                              <option value="K 450">K 450</option>
                              <option value="K 500">K 500</option>
                              <option value="K 600">K 600</option>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Campo Tipe Bahan (dropdown nativo) */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#b5eaff' : '#1976d2', mb: 1, fontWeight: 600 }}>Tipe Bahan</Typography>
                    <Box 
                      component="select"
                      value={newDocTipeBahan}
                      onChange={(e) => setNewDocTipeBahan(e.target.value)}
                      sx={getDropdownStyles(isDarkMode)}
                    >
                      <option value="" disabled style={{color: isDarkMode ? '#41e3ff' : '#1976d2'}}>Pilih Tipe Bahan</option>
                      {/* Tampilkan data dari API jika ada */}
                      {tipeBahanOptions.length > 0 && tipeBahanOptions
                        .filter(option => option.testType === newDocTipePengujian)
                        .map(option => (
                          <option 
                            key={option._id} 
                            value={option.value}
                            style={{
                              color: isDarkMode ? '#fff' : '#333',
                              backgroundColor: 'transparent',
                            }}
                          >
                            {option.value}
                          </option>
                        ))
                      }
                      {/* Tampilkan opsi default jika tidak ada data dari API */}
                      {(!tipeBahanOptions.length || !tipeBahanOptions.filter(option => option.testType === newDocTipePengujian).length) && (
                        <>
                          {newDocTipePengujian === 'Besi' && (
                            <>
                              <option value="BJTS (Ulir)" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>BJTS (Ulir)</option>
                              <option value="BJTP (Polos)" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>BJTP (Polos)</option>
                            </>
                          )}
                          {newDocTipePengujian === 'Beton' && (
                            <>
                              <option value="KUBUS" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>KUBUS</option>
                              <option value="SILINDER" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>SILINDER</option>
                              <option value="BALOK" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>BALOK</option>
                              <option value="PAVING" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>PAVING</option>
                              <option value="SCOUP" style={{ color: isDarkMode ? '#fff' : '#333', backgroundColor: 'transparent' }}>SCOUP</option>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {/* Pilih user tujuan dokumen dengan fitur search */}
                <Autocomplete
                  options={userList}
                  getOptionLabel={(option) => `${option.username} - ${option.fullname}`}
                  value={userList.find(user => user._id === targetUser) || null}
                  onChange={(_, value) => setTargetUser(value ? value._id : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="User Tujuan"
                      variant="outlined"
                      required
                      InputLabelProps={{ style: { color: isDarkMode ? '#b5eaff' : '#1976d2', fontWeight: 600 } }}
                      InputProps={{
                        ...params.InputProps,
                        style: {
                          color: isDarkMode ? '#fff' : '#333',
                          background: isDarkMode ? 'rgba(22, 35, 54, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontFamily: 'Open Sans',
                          fontSize: '0.9rem',
                          border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            background: isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(25,118,210,0.05)',
                          },
                          '&.Mui-focused': {
                            background: isDarkMode ? 'rgba(65,227,255,0.15)' : 'rgba(25,118,210,0.08)',
                            boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.5)' : '0 0 0 2px rgba(25,118,210,0.3)',
                          },
                        },
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}
                  PaperComponent={({ children, ...props }) => (
                    <Paper {...props} sx={{ background: isDarkMode ? '#162336' : '#ffffff', color: isDarkMode ? '#fff' : '#333', borderRadius: 2, border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}` }}>{children}</Paper>
                  )}
                  ListboxProps={{
                    sx: {
                      backgroundColor: isDarkMode ? '#162336' : '#ffffff',
                      color: isDarkMode ? '#fff' : '#333',
                      borderRadius: 2,
                      '& .MuiAutocomplete-option': {
                        '&:hover': {
                          backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                        },
                        '&[data-focus="true"]': {
                          backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.2)' : 'rgba(25, 118, 210, 0.2)'
                        },
                        '&[aria-selected="true"]': {
                          backgroundColor: isDarkMode ? 'rgba(65, 227, 255, 0.15)' : 'rgba(25, 118, 210, 0.15)'
                        }
                      }
                    }
                  }}
                />
              </>
            )}
            {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
          </Box>
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
            Batal
          </Button>
          <Button
            onClick={async () => {
              setAddLoading(true);
              setAddError('');
              try {
                const token = localStorage.getItem('token');
                
                // Validasi wajib BP, Mutu Bahan, Tipe Bahan, dan Tipe Pengujian untuk admin dan staff
                if ((userRole === 'admin' || userRole === 'staff') && (!newDocBP || !newDocKodeBahan || !newDocTipeBahan || !newDocTipePengujian)) {
                  setAddError('BP, Mutu Bahan, Tipe Bahan, dan Tipe Pengujian wajib diisi!');
                  return;
                }
                
                // Tambahkan log untuk debugging
                // Logging untuk debugging
console.log('userList:', userList);
console.log('targetUser:', targetUser);

// Validasi targetUser harus ObjectId (24 karakter hex)
const isValidObjectId = (id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
if (!isValidObjectId(targetUser)) {
  setAddError('User tujuan tidak valid. Silakan pilih ulang user.');
  setAddLoading(false);
  return;
}

// Mapping otomatis value frontend ke enum backend
// Pastikan nilai yang dikirim ke server sesuai dengan enum yang diharapkan backend
// Berdasarkan error, backend mengharapkan nilai enum yang case-sensitive

// Buat mapping untuk memastikan nilai yang benar
const tipeBahanEnumValues = {
  'Silinder': 'Silinder',
  'SILINDER': 'Silinder',
  'silinder': 'Silinder',
  'Kubus': 'Kubus',
  'KUBUS': 'Kubus',
  'kubus': 'Kubus',
  'Balok': 'Balok',
  'BALOK': 'Balok',
  'balok': 'Balok',
  'Paving': 'Paving',
  'PAVING': 'Paving',
  'paving': 'Paving',
  'Scoup': 'Scoup',
  'SCOUP': 'Scoup',
  'scoup': 'Scoup',
  'BJTS (Ulir)': 'Silinder',
  'BJTP (Polos)': 'Kubus'
};

// Gunakan mapping untuk mendapatkan nilai yang benar
let fixedTipeBahan = tipeBahanEnumValues[newDocTipeBahan] || newDocTipeBahan;

// Log untuk debugging
console.log('Tipe Pengujian:', newDocTipePengujian);
console.log('Tipe Bahan asli:', newDocTipeBahan);
console.log('Tipe Bahan yang akan dikirim:', fixedTipeBahan);

// Pastikan semua data dalam format yang benar
// Ensure tipePengujian is set based on mutuBahan if not explicitly selected
                let derivedTipePengujian = newDocTipePengujian;
                if (!derivedTipePengujian && newDocKodeBahan) {
                  if (newDocKodeBahan.startsWith('T')) {
                    derivedTipePengujian = 'Besi';
                  } else if (newDocKodeBahan.startsWith('K')) {
                    derivedTipePengujian = 'Beton';
                  }
                }
                
                const documentData = {
                  namaProyek: newNamaProyek,
                  bp: newDocBP ? parseFloat(newDocBP) : 0,
                  mutuBahan: newDocKodeBahan,
                  tipeBahan: fixedTipeBahan,
                  tipePengujian: derivedTipePengujian,
                  targetUser: targetUser || null
                };

console.log('Data yang akan dikirim:', documentData);
console.log('tipeBahan yang dikirim:', newDocTipeBahan);

try {
  const response = await axios.post(`${API_URL}/api/documents/manual`, documentData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Response dari server:', response.data);
} catch (error) {
  // Tampilkan pesan error backend ke UI
  const backendMsg = error.response?.data?.message || error.message || 'Server error';
  setAddError(backendMsg);
  console.error('Error detail:', error.response?.data);
  setAddLoading(false);
  return;
}
                setAddDialog(false);
                // Resetear todos los campos
                setNewNamaProyek('');
                setNewDocBP('');
                setNewDocKodeBahan('');
                setNewDocTipeBahan('');
                setNewDocTipePengujian('');
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
            disabled={addLoading || !newNamaProyek}
            sx={{ 
              background: '#41e3ff', 
              color: '#0a1929',
              fontWeight: 'bold',
              '&:hover': { background: '#65e7ff' },
              '&.Mui-disabled': { background: 'rgba(65,227,255,0.3)', color: '#193549' }
            }}
          >
            {addLoading ? <CircularProgress size={22} color="inherit" /> : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus dokumen "{selectedDocument?.namaProyek}"? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Batal</Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={22} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <Dialog 
        open={confirmUpdateDialog} 
        onClose={() => setConfirmUpdateDialog(false)}
        PaperProps={{
          sx: {
            background: isDarkMode ? 'rgba(20,32,54,0.92)' : 'rgba(255,255,255,0.95)',
            color: isDarkMode ? '#fff' : '#333',
            borderRadius: 3,
            boxShadow: isDarkMode ? '0 8px 32px 0 rgba(65,227,255,0.10)' : '0 8px 32px 0 rgba(0,0,0,0.10)',
            border: `1.5px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: isDarkMode ? '#41e3ff' : '#1565c0', 
          fontWeight: 700, 
          fontSize: 20,
          borderBottom: `1px solid ${isDarkMode ? 'rgba(65,227,255,0.2)' : 'rgba(25,118,210,0.2)'}`,
        }}>
          Konfirmasi Perbarui
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2, color: isDarkMode ? '#fff' : '#333' }}>
            Apakah Anda yakin ingin memperbarui dokumen "{selectedDocument?.namaProyek}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmUpdateDialog(false)}
            variant="outlined"
            sx={{ 
              color: isDarkMode ? '#41e3ff' : '#1976d2', 
              borderColor: isDarkMode ? '#41e3ff' : '#1976d2',
              '&:hover': { borderColor: isDarkMode ? '#41e3ff' : '#1976d2', background: isDarkMode ? 'rgba(65,227,255,0.08)' : 'rgba(25,118,210,0.08)' }
            }}
          >
            Batal
          </Button>
          <Button 
            onClick={confirmUpdate} 
            variant="contained"
            disabled={loading}
            sx={{
              ml: 2,
              background: isDarkMode ? 'linear-gradient(90deg, #41e3ff 0%, #1ec6e6 100%)' : 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
              color: isDarkMode ? '#0a1929' : '#ffffff',
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: isDarkMode ? '0 2px 8px 0 rgba(65,227,255,0.12)' : '0 2px 8px 0 rgba(25,118,210,0.2)',
              '&:hover': { background: isDarkMode ? '#65e7ff' : '#2196f3' },
              '&.Mui-disabled': { background: isDarkMode ? 'rgba(65,227,255,0.3)' : 'rgba(25,118,210,0.3)', color: isDarkMode ? '#193549' : '#e0e0e0' }
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Konfirmasi'}
          </Button>
        </DialogActions>
      </Dialog>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      </Box>
    </Box>
  </Box>
  );
}

export default Dashboard;
