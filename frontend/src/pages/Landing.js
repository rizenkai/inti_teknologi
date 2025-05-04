import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaFileAlt, FaClipboardList, FaLock, FaFolderOpen } from 'react-icons/fa';

const features = [
  {
    title: 'User Management',
    desc: 'Kelola user dengan role Admin, Staff, dan User. Admin dapat CRUD user, atur hak akses, dan monitoring aktivitas.',
    icon: <FaUserTie size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Document Workflow',
    desc: 'Upload, download, dan update dokumen (PDF, Word, Excel, dll) dengan notifikasi status dan versi terbaru.',
    icon: <FaFileAlt size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Activity Log',
    desc: 'Pantau semua aktivitas penting: upload, edit, status, dan akses dokumen secara transparan dan real-time.',
    icon: <FaClipboardList size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Role Access',
    desc: 'Kontrol penuh, aman, dan transparan dengan pengaturan hak akses yang fleksibel.',
    icon: <FaLock size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Unlimited Documents',
    desc: 'Tidak ada batas jumlah dokumen, upload, atau aktivitas untuk semua user.',
    icon: <FaFolderOpen size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden',
      fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundImage: "url('/Frame211332.png')",
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundColor: '#090d1f',
      /* Custom scrollbar agar transparan */
      '&::-webkit-scrollbar': {
        width: 6,
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255,255,255,0.01)',
        border: 'none',
      },
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.01) transparent',
    }}>
      {/* Hero Section */}
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
        position: 'relative',
        zIndex: 1,
        backgroundImage: "url('/Frame211332.png')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundColor: '#090d1f',
        overflow: 'hidden',
      }}>
        {/* Overlay gradient agar teks tetap jelas */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'radial-gradient(ellipse at 60% 40%, rgba(65,227,255,0.18) 0%, rgba(59,130,246,0.16) 40%, rgba(9,13,31,0.8) 100%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%', px: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 }, boxSizing: 'border-box' }}>
          <Typography sx={{ fontWeight: 500, color: '#fff', fontSize: { xs: '1rem', md: '1.25rem' }, mb: 1, letterSpacing: 1, fontFamily: 'Open Sans' }}>
            IntiDocs Document Management
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 600, fontSize: { xs: '2.1rem', md: '3.5rem' }, mb: 2, color: '#fff', letterSpacing: 0.5, fontFamily: 'Open Sans', lineHeight: 1.13 }}>
            Kolaborasi & kelola dokumen<br />lebih cepat, lebih mudah.
          </Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: { xs: '1rem', md: '1.25rem' }, mb: 4, fontFamily: 'Open Sans', maxWidth: 540, mx: 'auto' }}>
            Upload, kelola, dan pantau dokumen serta aktivitas tim Anda dalam satu platform modern dan aman.
          </Typography>
          <Button
            variant="contained"
            sx={{
              px: 5, py: 1.5, fontWeight: 900, fontSize: '1.1rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(65,227,255,0.18)',
              background: 'linear-gradient(90deg, #41e3ff 0%, #3b82f6 100%)',
              color: '#090d1f',
              textTransform: 'none',
              fontFamily: 'Open Sans',
              letterSpacing: 0.5
            }}
            onClick={() => navigate('/login')}
          >
            Mulai Sekarang
          </Button>
        </Box>
      </Box>
      {/* Features Section */}
      <Box sx={{ px: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#090d1f', boxSizing: 'border-box' }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Paper sx={{
                p: 3,
                borderRadius: '16px',
                background: 'rgba(20, 32, 54, 0.92)',
                color: '#fff',
                textAlign: 'center',
                boxShadow: '0 4px 24px 0 rgba(65,227,255,0.10)',
                minHeight: 170,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {feature.icon}
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 1, fontFamily: 'Open Sans' }}>{feature.title}</Typography>
                <Typography sx={{ color: '#b5eaff', fontWeight: 400, fontSize: '1rem', fontFamily: 'Open Sans' }}>{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Showcase Section (mockup images) */}
      <Box sx={{ px: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d1f', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Akses Cepat</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Semua dokumen & aktivitas dalam satu tempat</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Cari, upload, download, dan kelola dokumen serta pantau log aktivitas tanpa ribet.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/section_1.png"
            alt="Section 1"
            sx={{
              width: '100%',
              maxWidth: 340,
              height: 220,
              objectFit: 'cover',
              borderRadius: '22px',
              boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)',
              background: '#181e2b'
            }}
          />
        </Box>
      </Box>
      <Box sx={{ px: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row-reverse' }, gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d1f', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Role & Hak Akses</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Kontrol penuh, aman, dan transparan</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Admin bisa atur hak akses, staff fokus mengelola dokumen, user hanya akses dokumen yang diizinkan.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/section_2.png"
            alt="Section 2"
            sx={{
              width: '100%',
              maxWidth: 340,
              height: 220,
              objectFit: 'cover',
              borderRadius: '22px',
              boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)',
              background: '#181e2b'
            }}
          />
        </Box>
      </Box>
      <Box sx={{ px: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 }, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d1f', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, mb: { xs: 4, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography sx={{ color: '#41e3ff', fontWeight: 700, fontSize: '1.1rem', mb: 1, fontFamily: 'Open Sans' }}>Tanpa Batas</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 2, fontFamily: 'Open Sans' }}>Akses dokumen tanpa limit</Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: '1rem', mb: 2, fontFamily: 'Open Sans' }}>
            Tidak ada batas jumlah dokumen, upload, atau aktivitas untuk semua user.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/section_3.png"
            alt="Section 3"
            sx={{
              width: '100%',
              maxWidth: 340,
              height: 220,
              objectFit: 'cover',
              borderRadius: '22px',
              boxShadow: '0 4px 32px 0 rgba(65,227,255,0.09)',
              background: '#181e2b'
            }}
          />
        </Box>
      </Box>
      {/* Footer */}
      <Box sx={{ px: { xs: 2, md: 8 }, py: 4, textAlign: 'center', color: '#b5eaff', fontSize: '0.95rem', fontFamily: 'Open Sans', backgroundColor: '#090d1f' }}>
        &copy; {new Date().getFullYear()} IntiDocs. All rights reserved.
      </Box>
    </Box>
  );
};

export default Landing;
