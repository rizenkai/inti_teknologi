import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'User Management',
    desc: 'Kelola user dengan role Admin, Staff, dan User. Admin dapat CRUD user, atur hak akses, dan monitoring aktivitas.',
    icon: '👤',
  },
  {
    title: 'Document Workflow',
    desc: 'Upload, download, dan update dokumen (PDF, Word, Excel, dll) dengan notifikasi status dan versi terbaru.',
    icon: '📄',
  },
  {
    title: 'Activity Log',
    desc: 'Pantau semua aktivitas penting: upload, edit, status, dan akses dokumen secara transparan dan real-time.',
    icon: '📝',
  },
  {
    title: 'Role Access',
    desc: 'Kontrol penuh, aman, dan transparan dengan pengaturan hak akses yang fleksibel.',
    icon: '🔒',
  },
  {
    title: 'Unlimited Documents',
    desc: 'Tidak ada batas jumlah dokumen, upload, atau aktivitas untuk semua user.',
    icon: '📁',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#090d1f', fontFamily: 'Open Sans, Arial, Helvetica, sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box sx={{
        px: { xs: 2, md: 8 },
        pt: { xs: 6, md: 10 },
        pb: { xs: 4, md: 8 },
        background: 'radial-gradient(ellipse at top left, #41e3ff 0%, #3b82f6 40%, #090d1f 100%)',
        borderRadius: '0 0 40px 40px',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(65,227,255,0.12)',
      }}>
        <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', md: '3.2rem' }, mb: 2, color: '#fff', letterSpacing: 0.5, fontFamily: 'Open Sans' }}>
          Kelola Dokumen & Tim<br />Lebih Mudah, Aman, Modern.
        </Typography>
        <Typography sx={{ color: '#b5eaff', fontSize: '1.1rem', mb: 4, fontFamily: 'Open Sans' }}>
          Platform manajemen dokumen digital, kolaborasi, dan monitoring aktivitas untuk organisasi modern.
        </Typography>
        <Button
          variant="contained"
          sx={{
            px: 5, py: 1.5, fontWeight: 900, fontSize: '1.1rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(65,227,255,0.18)',
            background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
            color: '#090d1f',
            textTransform: 'none',
            fontFamily: 'Open Sans'
          }}
          onClick={() => navigate('/login')}
        >
          Mulai Sekarang
        </Button>
      </Box>
      {/* Features Section */}
      <Box sx={{ px: { xs: 2, md: 8 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((f, idx) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Paper elevation={4} sx={{ bgcolor: '#10172a', color: '#fff', borderRadius: '18px', p: 4, textAlign: 'center', minHeight: 180, boxShadow: '0 4px 32px 0 rgba(65,227,255,0.06)', fontFamily: 'Open Sans' }}>
                <Box sx={{ fontSize: 38, mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, fontFamily: 'Open Sans' }}>{f.title}</Typography>
                <Typography sx={{ color: '#b5eaff', fontSize: '1rem', fontFamily: 'Open Sans' }}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Showcase Section (mockup images) */}
      <Box sx={{ px: { xs: 2, md: 8 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Akses Cepat</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Semua dokumen & aktivitas dalam satu tempat</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Cari, upload, download, dan kelola dokumen serta pantau log aktivitas tanpa ribet.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 340, height: 220, bgcolor: '#181e2b', borderRadius: '22px', boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)' }} />
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2, md: 8 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, gap: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Role & Hak Akses</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Kontrol penuh, aman, dan transparan</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Admin bisa atur hak akses, staff fokus mengelola dokumen, user hanya akses dokumen yang diizinkan.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 340, height: 220, bgcolor: '#181e2b', borderRadius: '22px', boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)' }} />
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2, md: 8 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Tanpa Batas</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Akses dokumen tanpa limit</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Tidak ada batas jumlah dokumen, upload, atau aktivitas untuk semua user.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 340, height: 220, bgcolor: '#181e2b', borderRadius: '22px', boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)' }} />
        </Box>
      </Box>
      {/* Footer */}
      <Box sx={{ px: { xs: 2, md: 8 }, py: 4, textAlign: 'center', color: '#b5eaff', fontSize: '0.95rem', fontFamily: 'Open Sans' }}>
        &copy; {new Date().getFullYear()} IntiDocs. All rights reserved.
      </Box>
    </Box>
  );
};

export default Landing;
