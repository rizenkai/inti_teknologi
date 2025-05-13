import React, { useState, useEffect } from 'react';
import { GlobalStyles } from '@mui/material';
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
  Autocomplete,
  Avatar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

// Status color mapping
const statusColors = {
  pending: '#FFE082',      // Kuning pastel
  review: '#FFAB91',      // Jingga pastel
  in_progress: '#80D8FF', // Biru pastel
  completed: '#A5D6A7',   // Hijau pastel
};
const statusLabels = {
  pending: 'Pending',
  review: 'Review',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const Dashboard = () => {
  const navigate = useNavigate();
  // NEW: State for Add Document Dialog
  const [addDialog, setAddDialog] = useState(false);

  const [newNamaProyek, setNewNamaProyek] = useState('');
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
  const [newMutuBahan, setNewMutuBahan] = useState('');
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
    setNewMutuBahan(document.mutuBahan || '');
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
        updateData.mutuBahan = newMutuBahan;
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

  // Filter documents based on search term (namaProyek, placeholder id, etc)
  const filteredDocuments = documents.filter(doc => {
    const search = searchTerm.toLowerCase();
    // Cari berdasarkan namaProyek, placeholder id (placeholderId, filePath, _id), dan user tujuan
    const placeholderId = (doc.placeholderId || '').toString().toLowerCase();
    const filePathId = (doc.filePath || '').toString().toLowerCase();
    const docId = (doc._id || '').toString().toLowerCase();
    return (
      (doc.namaProyek || doc.title || '').toLowerCase().includes(search) ||
      placeholderId.includes(search) ||
      filePathId.includes(search) ||
      docId.includes(search) ||
      (doc.targetUser && (
        (doc.targetUser.username || '').toLowerCase().includes(search) ||
        (doc.targetUser.fullname || '').toLowerCase().includes(search)
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

  // Pie Chart Data: hitung jumlah dokumen per status
  // Hitung jumlah dokumen per status
  const statusCounts = {};
  filteredDocuments.forEach(doc => {
    const status = doc.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const allStatus = ['pending', 'in_progress', 'review', 'completed'];
  const pieLabels = allStatus.map(s => statusLabels[s]);
  const pieColors = allStatus.map(s => statusColors[s]);
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

  // Ringkasan dokumen terbaru (ambil dokumen paling baru dari filteredDocuments)
  const latestDoc = filteredDocuments[0];
  // Hitung statistik
  const totalDocs = documents.length;
  // const storageUsed = 85; // Sudah tidak dipakai

  return (
  <Box sx={{ minHeight: '100vh', width: '100%', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif', color: '#fff', backgroundImage: "url('/Frame211332.png')", backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundColor: '#090d1f', overflowX: 'hidden' }}>
    {/* Tidak ada header/topbar putih di sini. Jika masih muncul, cek file layout utama seperti App.js atau MainLayout.js */}

    {/* Konten utama */}
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Overlay gradient agar teks tetap jelas */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'radial-gradient(ellipse at 60% 40%, rgba(65,227,255,0.18) 0%, rgba(59,130,246,0.16) 40%, rgba(9,13,31,0.8) 100%)', pointerEvents: 'none' }} />

      {/* Konten dashboard */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 2, md: 3 }, pt: 5, position: 'relative', zIndex: 1 }}>



      {/* Search & Add New Document - PINDAH KE ATAS */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
        <TextField
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{ style: { color: '#fff', background: 'rgba(65,227,255,0.15)', borderRadius: 2 } }}
          variant="outlined"
          size="small"
          placeholder="Cari Dokumen"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ bgcolor: 'rgba(20,32,54,0.88)', borderRadius: 2, border: '1.5px solid #41e3ff', input: { color: '#fff' }, width: '100%', flex: 1, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' }, '& input::placeholder': { color: '#bdbdbd', opacity: 1 }, mb: { xs: 1, sm: 0 } }}

        />
        {(userRole === 'admin' || userRole === 'staff') && (
          <Button
            variant="contained"
            sx={{ bgcolor: '#41e3ff', color: '#111a2b', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#1ec6e6' }, width: { xs: '100%', sm: 'auto' }, minWidth: 140, mt: { xs: 0, sm: 0 } }}
            onClick={() => setAddDialog(true)}
          >
            Add New Document
          </Button>
        )}
      </Box>

      {/* Card Statistik & Pie Chart Gabung */}
      <Paper elevation={0} sx={{ width: '100%', mb: 4, p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', backdropFilter: 'blur(10px)', background: 'rgba(20,32,54,0.68)', border: '1.5px solid rgba(59,130,246,0.18)', color: '#fff' }}>

        <Box sx={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, mb: { xs: 2, md: 0 } }}>
          {/* Judul dihapus agar header tidak dobel */}
          <Box sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: '#41e3ff', lineHeight: 1 }}>{totalDocs.toLocaleString()}</Box>
          <Typography sx={{ fontSize: { xs: 14, md: 16 }, color: '#b5eaff' }}>Total Documents</Typography>
        </Box>
        <Box sx={{ flex: 2, minWidth: { xs: 160, md: 220 }, maxWidth: { xs: 320, md: 480 }, height: { xs: 120, md: 180 }, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, md: 2 }, color: '#fff' }}>
          <Box sx={{ width: { xs: 90, md: 140 }, height: { xs: 90, md: 140 } }}>
            <Pie data={pieData} options={{...pieOptions, plugins: { ...pieOptions.plugins, legend: { display: false } }, maintainAspectRatio: false}} />
          </Box>
          <Box sx={{ ml: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {pieData.labels.map((label, i) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: pieData.datasets[0].backgroundColor[i], border: '1.5px solid #e5e7eb', mr: 1 }} />
                <Typography sx={{ fontSize: { xs: 13, md: 15 } }}>{label.replace('_', ' ')}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>



      {/* Grid kartu dokumen dan placeholder, maksimal 3 per baris, styling mirip gambar, RESPONSIF */}
      <Box sx={{ width: '100%', mb: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 1.5, sm: 2, md: 4 } }}>
        {filteredDocuments.map((doc, idx) => (
          <Box key={doc._id} sx={{ minWidth: { xs: 0, sm: 250, md: 320 }, maxWidth: '100%' }}>
            <Paper elevation={0} sx={{
              minHeight: { xs: 160, md: 220 },
              p: { xs: 1.5, sm: 2, md: 2.5 },
              border: '1.5px solid #41e3ff',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
              background: 'rgba(65,227,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
            }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: { xs: 11, md: 13 }, fontWeight: 500, color: '#b5eaff' }}>#{doc.placeholderId || doc._id}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, mb: 0.5, color: '#fff' }}>{doc.namaProyek || doc.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ px: 1.2, py: 0.2, bgcolor: statusColors[doc.status] || '#e7f6fd', color: '#222', borderRadius: 1, fontWeight: 600, fontSize: 13, minWidth: 86, textAlign: 'center' }}>
                  {statusLabels[doc.status] || doc.status}
                </Box>
              </Box>
              <Box sx={{ fontSize: 14, mb: 0.5, display: 'flex', justifyContent: 'space-between', color: '#b5eaff' }}>
                <span>BP (Kg):</span> <b style={{ color: '#fff' }}>{doc.bp || '-'}</b>
              </Box>
              <Box sx={{ fontSize: 14, mb: 0.5, display: 'flex', justifyContent: 'space-between', color: '#b5eaff' }}>
                <span>Mutu Bahan:</span> <b style={{ color: '#fff' }}>{doc.mutuBahan || '-'}</b>
              </Box>
              <Box sx={{ fontSize: 14, mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                <span>Tipe Bahan:</span> <b>{doc.tipeBahan || '-'}</b>
              </Box>
              <Box sx={{ fontSize: 14, mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                <span>Submission:</span> <b>{formatDate(doc.submissionDate)}</b>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 0.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 16 }}>{doc.targetUser?.fullname?.charAt(0) || '?'}</Avatar>
                <Typography sx={{ fontSize: 15 }}>{doc.targetUser?.fullname || '-'}</Typography>
                {/* Icon edit/delete jika sebelumnya memang ada (tidak menambah fungsi baru) */}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {userRole === 'admin' || userRole === 'staff' ? (
                    <>
                      <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleEdit(doc)}>
                        <span role="img" aria-label="edit" style={{ fontSize: 18, color: '#3b82f6' }}>✎</span>
                      </IconButton>
                      <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleDelete(doc)}>
                        <span role="img" aria-label="delete" style={{ fontSize: 18, color: '#e74c3c' }}>🗑️</span>
                      </IconButton>
                    </>
                  ) : null}
                </Box>
              </Box>
              {/* Tampilkan keterangan "Document uploaded on" jika dokumen memiliki file atau status completed */}
              {(doc.fileUrl || doc.hasFile || doc.file || doc.filename || doc.status === 'completed') && (
                <Typography sx={{ color: '#8c8c8c', fontSize: 13, mt: 0 }}>
                  <span style={{ verticalAlign: 'middle', marginRight: 4 }}>📄</span>
                  Document uploaded on {formatDate(doc.lastModified)}
                </Typography>
              )}
            </Paper>
          </Box>
        ))}

      </Box>


      {/* Dialogs ... */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth
  PaperProps={{
    sx: {
      background: 'rgba(20,32,54,0.92)',
      color: '#fff',
      borderRadius: 3,
      boxShadow: '0 8px 32px 0 rgba(65,227,255,0.10)',
      border: '1.5px solid #41e3ff',
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>
        <DialogTitle sx={{ color: '#41e3ff', fontWeight: 700, fontSize: 22, pb: 2, fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
          Edit Document
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2, bgcolor: '#162336', borderRadius: 2 }}>
              <InputLabel sx={{ color: '#b5eaff', fontWeight: 600 }}>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
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
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status} sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>
                    {status.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subnamaProyek1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Material
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Campo BP (Kg) */}
                  <>
<TextField
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: '#162336',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      paddingLeft: 8,
    },
  }}
  margin="dense"
  label="BP (Kg)"
  type="number"
  inputProps={{ step: 'any', style: { color: '#fff', background: '#162336' }, autoComplete: 'off' }}
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
      borderColor: '#41e3ff',
    },
    '& input': {
      color: '#fff',
      background: '#162336',
      borderRadius: '8px',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      '-webkit-text-fill-color': '#fff',
      boxShadow: '0 0 0 1000px #162336 inset',
    },
    '& input::placeholder': {
      color: '#b5eaff',
      opacity: 1,
    },
  }}
/></>
                  
                  {/* Campo Mutu Bahan */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mb: 2, bgcolor: '#162336', borderRadius: 2 }} required>
                    <InputLabel sx={{ color: '#b5eaff', fontWeight: 600 }}>Mutu Bahan</InputLabel>
                    <Select
                      value={newMutuBahan}
                      label="Mutu Bahan"
                      onChange={e => setNewMutuBahan(e.target.value)}
                      required
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
                      <MenuItem value="K 125" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 125</MenuItem>
                      <MenuItem value="K 150" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 150</MenuItem>
                      <MenuItem value="K 175" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 175</MenuItem>
                      <MenuItem value="K 200" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 200</MenuItem>
                      <MenuItem value="K 225" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 225</MenuItem>
                      <MenuItem value="K 250" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 250</MenuItem>
                      <MenuItem value="K 300" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 300</MenuItem>
                      <MenuItem value="K 350" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 350</MenuItem>
                      <MenuItem value="K 400" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 400</MenuItem>
                      <MenuItem value="K 450" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 450</MenuItem>
                      <MenuItem value="K 500" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 500</MenuItem>
                      <MenuItem value="K 600" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>K 600</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Campo Tipe Bahan (dropdown) */}
                  <FormControl sx={{ flexGrow: 1, minWidth: '200px', mt: 1, mb: 2, bgcolor: '#162336', borderRadius: 2 }}>
                    <InputLabel sx={{ color: '#b5eaff', fontWeight: 600 }}>Tipe Bahan</InputLabel>
                    <Select
                      value={newTipeBahan}
                      label="Tipe Bahan"
                      onChange={e => setNewTipeBahan(e.target.value)}
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
                      <MenuItem value="" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}><em>None</em></MenuItem>
                      <MenuItem value="Silinder" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>Silinder</MenuItem>
                      <MenuItem value="Kubus" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>Kubus</MenuItem>
                      <MenuItem value="Balok" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>Balok</MenuItem>
                      <MenuItem value="Paving" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>Paving</MenuItem>
                      <MenuItem value="Scoup" sx={{ color: '#fff', backgroundColor: 'transparent', '&.Mui-selected': { backgroundColor: '#22304d', color: '#41e3ff' }, '&:hover': { backgroundColor: '#22304d', color: '#41e3ff' } }}>Scoup</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
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
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: '#162336',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      paddingLeft: 8,
    },
  }}
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
      borderColor: '#41e3ff',
    },
    '& input': {
      color: '#fff',
      background: '#162336',
      borderRadius: '8px',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      '-webkit-text-fill-color': '#fff',
      boxShadow: '0 0 0 1000px #162336 inset',
    },
    '& input::placeholder': {
      color: '#b5eaff',
      opacity: 1,
    },
  }}
/>
                  )}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}
                />
              </>
            )}
          </Box>
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
            onClick={handleDocumentUpdate} 
            variant="contained"
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
            Update
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth
  PaperProps={{
    sx: {
      background: 'rgba(20,32,54,0.92)',
      color: '#fff',
      borderRadius: 3,
      boxShadow: '0 8px 32px 0 rgba(65,227,255,0.10)',
      border: '1.5px solid #41e3ff',
      backdropFilter: 'blur(8px)',
      p: { xs: 2, md: 4 },
    }
  }}
>

        <DialogTitle sx={{ color: '#41e3ff', fontWeight: 700, fontSize: 22, pb: 2, fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' }}>
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
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{ style: { color: '#fff', background: 'rgba(65,227,255,0.15)', borderRadius: 2 } }}
/>

            
            {/* Campos adicionales solo para admin y staff */}
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Typography variant="subnamaProyek1" sx={{ mt: 2, mb: 1 }}>
                  Informasi Material
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Campo BP (Kg) */}
                  <TextField
  margin="dense"
  label="BP (Kg)"
  type="number"
  inputProps={{ 
    step: 'any',
    style: { color: '#fff', background: '#162336' }
  }}
  value={newDocBP}
  onChange={e => setNewDocBP(e.target.value)}
  required
  InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
  InputProps={{
    style: {
      color: '#fff',
      background: '#162336',
      borderRadius: 8,
      border: '1.5px solid #41e3ff',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      paddingLeft: 8,
    },
  }}
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
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#41e3ff',
    },
    '& input': {
      color: '#fff',
      background: '#162336',
      borderRadius: '8px',
      fontFamily: 'Open Sans',
      fontWeight: 600,
      '-webkit-text-fill-color': '#fff',
      boxShadow: '0 0 0 1000px #162336 inset',
    },
    '& input::placeholder': {
      color: '#b5eaff',
      opacity: 1,
    },
  }}
/>
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
      InputLabelProps={{ style: { color: '#b5eaff', fontWeight: 600 } }}
      InputProps={{
        ...params.InputProps,
        style: {
          color: '#fff',
          background: 'rgba(65,227,255,0.15)',
          borderRadius: 8,
          fontWeight: 600,
        },
      }}
    />
  )}
  isOptionEqualToValue={(option, value) => option._id === value._id}
  sx={{ flexGrow: 1, minWidth: '200px', mt: 1 }}
  PaperComponent={({ children, ...props }) => (
    <Paper {...props} sx={{ background: '#232b3e', color: '#fff', borderRadius: 2 }}>{children}</Paper>
  )}
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
                
                // Validasi wajib BP, Mutu Bahan, Tipe Bahan untuk admin dan staff
                if ((userRole === 'admin' || userRole === 'staff') && (!newDocBP || !newDocKodeBahan || !newDocTipeBahan)) {
                  setAddError('BP, Mutu Bahan, dan Tipe Bahan wajib diisi!');
                }
                
                const documentData = {
                  namaProyek: newNamaProyek,
                  bp: newDocBP,
                  mutuBahan: newDocKodeBahan,
                  tipeBahan: newDocTipeBahan,
                  targetUser
                };
                await axios.post('http://localhost:5000/api/documents/manual', documentData, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setAddDialog(false);
                // Resetear todos los campos
                setNewNamaProyek('');
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
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete document "{selectedDocument?.namaProyek}"? This action cannot be undone.
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
      </Box>
    </Box>
  </Box>
  );
}

export default Dashboard;
