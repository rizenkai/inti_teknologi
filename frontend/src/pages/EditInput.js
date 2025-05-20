import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const EditInput = () => {
  // State untuk pilihan tipe pengujian
  const [testType, setTestType] = useState('');
  
  // State untuk pilihan kategori (mutu bahan / tipe bahan)
  const [category, setCategory] = useState('');
  
  // State untuk nilai baru yang akan ditambahkan
  const [newValue, setNewValue] = useState('');
  
  // State untuk daftar nilai yang sudah ada
  const [existingValues, setExistingValues] = useState([]);
  
  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // State untuk dialog konfirmasi hapus
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Effect untuk mengambil data nilai yang sudah ada saat tipe pengujian dan kategori berubah
  useEffect(() => {
    if (testType && category) {
      fetchExistingValues();
    }
  }, [testType, category]);
  
  // Fungsi untuk mengambil data nilai yang sudah ada
  const fetchExistingValues = async () => {
    setLoading(true);
    try {
      // Buat array untuk nilai default
      const defaultValues = [];
      
      // Tambahkan nilai default berdasarkan kategori dan tipe pengujian
      if (category === 'mutuBahan') {
        if (testType === 'Besi') {
          defaultValues.push({ _id: 'default-1', value: 'T 280' });
          defaultValues.push({ _id: 'default-2', value: 'T 420' });
        } else if (testType === 'Beton') {
          defaultValues.push({ _id: 'default-3', value: 'K 225' });
          defaultValues.push({ _id: 'default-4', value: 'K 250' });
          defaultValues.push({ _id: 'default-5', value: 'K 300' });
          defaultValues.push({ _id: 'default-6', value: 'K 350' });
          defaultValues.push({ _id: 'default-7', value: 'K 400' });
          defaultValues.push({ _id: 'default-8', value: 'K 450' });
          defaultValues.push({ _id: 'default-9', value: 'K 500' });
          defaultValues.push({ _id: 'default-10', value: 'K 600' });
        }
      } else if (category === 'tipeBahan') {
        if (testType === 'Besi') {
          defaultValues.push({ _id: 'default-11', value: 'BJTS (Ulir)' });
          defaultValues.push({ _id: 'default-12', value: 'BJTP (Polos)' });
        } else if (testType === 'Beton') {
          defaultValues.push({ _id: 'default-13', value: 'KUBUS' });
          defaultValues.push({ _id: 'default-14', value: 'SILINDER' });
          defaultValues.push({ _id: 'default-15', value: 'BALOK' });
          defaultValues.push({ _id: 'default-16', value: 'PAVING' });
          defaultValues.push({ _id: 'default-17', value: 'SCOUP' });
        }
      }
      
      // Ambil data dari API
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/inputs/values?testType=${testType}&category=${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Gabungkan data dari API dengan nilai default
      let combinedValues = [...defaultValues];
      
      if (response.data && response.data.length > 0) {
        // Filter nilai dari API yang tidak ada di nilai default
        const apiValues = response.data.filter(apiItem => {
          return !defaultValues.some(defaultItem => defaultItem.value === apiItem.value);
        });
        
        // Gabungkan nilai default dengan nilai dari API
        combinedValues = [...defaultValues, ...apiValues];
      }
      
      // Set nilai gabungan ke state
      setExistingValues(combinedValues);
    } catch (error) {
      console.error('Error fetching values:', error);
      setError('Failed to fetch existing values');
      
      // Jika terjadi error, gunakan data default saja
      const defaultValues = [];
      
      if (category === 'mutuBahan') {
        if (testType === 'Besi') {
          defaultValues.push({ _id: 'default-1', value: 'T 280' });
          defaultValues.push({ _id: 'default-2', value: 'T 420' });
        } else if (testType === 'Beton') {
          defaultValues.push({ _id: 'default-3', value: 'K 225' });
          defaultValues.push({ _id: 'default-4', value: 'K 250' });
          defaultValues.push({ _id: 'default-5', value: 'K 300' });
          defaultValues.push({ _id: 'default-6', value: 'K 350' });
          defaultValues.push({ _id: 'default-7', value: 'K 400' });
          defaultValues.push({ _id: 'default-8', value: 'K 450' });
          defaultValues.push({ _id: 'default-9', value: 'K 500' });
          defaultValues.push({ _id: 'default-10', value: 'K 600' });
        }
      } else if (category === 'tipeBahan') {
        if (testType === 'Besi') {
          defaultValues.push({ _id: 'default-11', value: 'BJTS (Ulir)' });
          defaultValues.push({ _id: 'default-12', value: 'BJTP (Polos)' });
        } else if (testType === 'Beton') {
          defaultValues.push({ _id: 'default-13', value: 'KUBUS' });
          defaultValues.push({ _id: 'default-14', value: 'SILINDER' });
          defaultValues.push({ _id: 'default-15', value: 'BALOK' });
          defaultValues.push({ _id: 'default-16', value: 'PAVING' });
          defaultValues.push({ _id: 'default-17', value: 'SCOUP' });
        }
      }
      
      setExistingValues(defaultValues);
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk menambahkan nilai baru
  const handleAddValue = async () => {
    // Validasi input
    if (!newValue.trim()) {
      setError('Please enter a value');
      return;
    }
    
    // Validasi format untuk mutu bahan
    if (category === 'mutuBahan') {
      const prefix = testType === 'Besi' ? 'T' : 'K';
      if (!newValue.startsWith(prefix)) {
        setError(`Mutu Bahan for ${testType} should start with "${prefix}"`);
        return;
      }
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/inputs/values', {
        value: newValue,
        category,
        testType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Tambahkan nilai baru ke daftar yang ditampilkan tanpa perlu fetch ulang
      const newItem = response.data;
      
      // Periksa apakah nilai sudah ada di daftar
      const valueExists = existingValues.some(item => item.value === newItem.value);
      
      // Jika nilai belum ada, tambahkan ke daftar
      if (!valueExists) {
        setExistingValues(prevValues => [newItem, ...prevValues]);
      }
      
      setSuccess('Value added successfully');
      setNewValue('');
    } catch (error) {
      console.error('Error adding value:', error);
      setError(error.response?.data?.message || 'Failed to add value');
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk membuka dialog konfirmasi hapus
  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };
  
  // Fungsi untuk menutup dialog konfirmasi hapus
  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };
  
  // Fungsi untuk menghapus nilai
  const handleDeleteValue = async () => {
    if (!itemToDelete) return;
    
    const id = itemToDelete._id;
    
    // Jika ID dimulai dengan 'default-', itu adalah nilai default yang tidak bisa dihapus
    if (id.startsWith('default-')) {
      setError('Nilai default tidak dapat dihapus. Ini adalah nilai bawaan sistem.');
      closeDeleteConfirm();
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/inputs/values/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Value deleted successfully');
      fetchExistingValues();
      closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting value:', error);
      setError(error.response?.data?.message || 'Failed to delete value');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#fff', fontWeight: 700 }}>
        Edit Input Options
      </Typography>
      
      {/* Snackbar untuk pesan sukses */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Alert untuk pesan error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4, background: 'rgba(20,32,54,0.88)', borderRadius: 2, border: '1.5px solid #41e3ff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#41e3ff', fontWeight: 600 }}>
          1. Pilih Tipe Pengujian
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <Select
            value={testType}
            onChange={(e) => {
              setTestType(e.target.value);
              setCategory('');
              setNewValue('');
              setExistingValues([]);
            }}
            displayEmpty
            sx={{ 
              color: '#fff', 
              bgcolor: '#162336',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#41e3ff' },
              '& .MuiSvgIcon-root': { color: '#41e3ff' }
            }}
            MenuProps={{
              PaperProps: {
                sx: { bgcolor: '#162336' }
              }
            }}
          >
            <MenuItem value="" disabled sx={{ color: '#b5eaff' }}>
              <em>Pilih Tipe Pengujian</em>
            </MenuItem>
            <MenuItem value="Besi" sx={{ color: '#fff' }}>Besi</MenuItem>
            <MenuItem value="Beton" sx={{ color: '#fff' }}>Beton</MenuItem>
          </Select>
        </FormControl>
        
        {testType && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: '#41e3ff', fontWeight: 600 }}>
              2. Pilih Kategori
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setNewValue('');
                  setExistingValues([]);
                }}
              >
                <FormControlLabel 
                  value="mutuBahan" 
                  control={<Radio sx={{ color: '#41e3ff', '&.Mui-checked': { color: '#41e3ff' } }} />} 
                  label="Mutu Bahan" 
                  sx={{ color: '#fff' }}
                />
                <FormControlLabel 
                  value="tipeBahan" 
                  control={<Radio sx={{ color: '#41e3ff', '&.Mui-checked': { color: '#41e3ff' } }} />} 
                  label="Tipe Bahan" 
                  sx={{ color: '#fff' }}
                />
              </RadioGroup>
            </FormControl>
          </>
        )}
        
        {testType && category && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: '#41e3ff', fontWeight: 600 }}>
              3. Input {category === 'mutuBahan' ? 'Mutu Bahan' : 'Tipe Bahan'} Baru
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 3 }}>
              <TextField
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  category === 'mutuBahan' 
                    ? `${testType === 'Besi' ? 'T' : 'K'} xxx (contoh: ${testType === 'Besi' ? 'T 280' : 'K 225'})` 
                    : 'Masukkan tipe bahan baru'
                }
                fullWidth
                sx={{ 
                  mr: 2,
                  '& .MuiOutlinedInput-root': { 
                    color: '#fff',
                    '& fieldset': { borderColor: '#41e3ff' },
                    '&:hover fieldset': { borderColor: '#41e3ff' },
                    '&.Mui-focused fieldset': { borderColor: '#41e3ff' }
                  },
                  '& .MuiInputBase-input': { bgcolor: '#162336' }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddValue}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{ 
                  bgcolor: '#41e3ff', 
                  color: '#111a2b', 
                  fontWeight: 600, 
                  '&:hover': { bgcolor: '#1ec6e6' },
                  minWidth: 100
                }}
              >
                Tambah
              </Button>
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2, color: '#41e3ff', fontWeight: 600 }}>
              Daftar {category === 'mutuBahan' ? 'Mutu Bahan' : 'Tipe Bahan'} yang Tersedia
            </Typography>
            
            {loading && existingValues.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress sx={{ color: '#41e3ff' }} />
              </Box>
            ) : existingValues.length === 0 ? (
              <Typography sx={{ color: '#b5eaff', fontStyle: 'italic', textAlign: 'center', my: 2 }}>
                Belum ada data
              </Typography>
            ) : (
              <List sx={{ bgcolor: '#162336', borderRadius: 2, overflow: 'hidden' }}>
                {existingValues.map((item, index) => (
                  <React.Fragment key={item._id}>
                    {index > 0 && <Divider sx={{ bgcolor: 'rgba(65,227,255,0.1)' }} />}
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          color="error" 
                          onClick={() => openDeleteConfirm(item)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={item.value} 
                        sx={{ '& .MuiListItemText-primary': { color: '#fff' } }}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </Paper>
      
      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#162336',
            color: '#fff',
            border: '1px solid #41e3ff',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: '#41e3ff' }}>
          Konfirmasi Hapus
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#b5eaff' }}>
            Apakah Anda yakin ingin menghapus nilai "{itemToDelete?.value}"?
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeDeleteConfirm} 
            sx={{ 
              color: '#b5eaff',
              '&:hover': { backgroundColor: 'rgba(65,227,255,0.1)' } 
            }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleDeleteValue} 
            autoFocus
            sx={{ 
              bgcolor: '#e74c3c', 
              color: '#fff',
              '&:hover': { bgcolor: '#c0392b' } 
            }}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditInput;
