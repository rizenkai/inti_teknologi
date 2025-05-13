import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaFlask, FaTools, FaHardHat, FaAward, FaChartLine } from 'react-icons/fa';

// Layanan pengujian yang ditawarkan
const services = [
  {
    title: 'Pengujian Beton',
    desc: 'Pengujian kuat tekan, slump test, dan analisis komposisi beton untuk memastikan kualitas dan keamanan struktur.',
    icon: <FaBuilding size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Pengujian Besi & Baja',
    desc: 'Uji tarik, kekerasan, dan komposisi material besi dan baja untuk memastikan kekuatan dan daya tahan.',
    icon: <FaTools size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Analisis Laboratorium',
    desc: 'Analisis komprehensif material konstruksi dengan peralatan laboratorium canggih dan standar internasional.',
    icon: <FaFlask size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Konsultasi Teknis',
    desc: 'Layanan konsultasi oleh ahli berpengalaman untuk membantu proyek konstruksi Anda memenuhi standar keamanan.',
    icon: <FaHardHat size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Sertifikasi Material',
    desc: 'Penerbitan sertifikat kualitas material yang diakui secara nasional untuk kebutuhan proyek dan tender.',
    icon: <FaAward size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Monitoring Kualitas',
    desc: 'Layanan pemantauan kualitas berkelanjutan selama proyek konstruksi untuk memastikan standar terpenuhi.',
    icon: <FaChartLine size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
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
      backgroundImage: "url('/Frame211332.jpg')",
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
        backgroundImage: "url('/Frame211332.jpg')",
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
            INTI TEKNOLOGI PENGUJIAN MATERIAL
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 600, fontSize: { xs: '2.1rem', md: '3.5rem' }, mb: 2, color: '#fff', letterSpacing: 0.5, fontFamily: 'Open Sans', lineHeight: 1.13 }}>
            Keunggulan dalam Pengujian<br />Material Konstruksi
          </Typography>
          <Typography sx={{ color: '#b5eaff', fontSize: { xs: '1rem', md: '1.25rem' }, mb: 4, fontFamily: 'Open Sans', maxWidth: 640, mx: 'auto' }}>
            Laboratorium terakreditasi dengan standar internasional untuk pengujian beton, besi, dan material konstruksi lainnya. Memastikan kualitas dan keamanan proyek Anda.
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
      {/* Services section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4, md: 6 },
        background: 'linear-gradient(180deg, rgba(9,13,31,0.95) 0%, rgba(16,24,40,0.95) 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 1, color: '#fff' }}>
          Layanan Pengujian
        </Typography>
        <Typography sx={{ textAlign: 'center', color: '#b5eaff', fontSize: { xs: '1rem', md: '1.1rem' }, mb: 6, maxWidth: 700, mx: 'auto' }}>
          Solusi komprehensif untuk kebutuhan pengujian material konstruksi Anda
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={0} sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(16,24,40,0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(65,227,255,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(65,227,255,0.3)',
                }
              }}>
                {service.icon}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#fff' }}>
                  {service.title}
                </Typography>
                <Typography sx={{ color: '#b5eaff', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {service.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* About Us section */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4, md: 6 },
        background: 'linear-gradient(180deg, rgba(16,24,40,0.95) 0%, rgba(9,13,31,0.95) 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2, color: '#fff' }}>
          Tentang Kami
        </Typography>
        <Typography sx={{ color: '#b5eaff', fontSize: { xs: '1rem', md: '1.1rem' }, mb: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
          Berpengalaman lebih dari 15 tahun dalam industri pengujian material konstruksi
        </Typography>
        
        <Grid container spacing={6} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(65,227,255,0.1)' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>
                Visi Kami
              </Typography>
              <Typography sx={{ color: '#b5eaff', fontSize: '1rem', lineHeight: 1.7 }}>
                Menjadi laboratorium pengujian material konstruksi terkemuka di Indonesia yang dikenal karena keakuratan, integritas, dan layanan berkualitas tinggi, serta berkontribusi pada pembangunan infrastruktur yang aman dan berkelanjutan.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(65,227,255,0.1)' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>
                Misi Kami
              </Typography>
              <Typography sx={{ color: '#b5eaff', fontSize: '1rem', lineHeight: 1.7 }}>
                Menyediakan layanan pengujian material yang akurat dan tepat waktu, mengembangkan metode pengujian inovatif, dan membantu klien memenuhi standar kualitas tertinggi dalam proyek konstruksi mereka melalui teknologi canggih dan tenaga ahli berpengalaman.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Contact section */}
      <Box sx={{
        py: { xs: 6, md: 8 },
        px: { xs: 2, sm: 4, md: 6 },
        background: 'linear-gradient(180deg, rgba(16,24,40,0.95) 0%, rgba(9,13,31,0.95) 100%)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2, color: '#fff' }}>
          Hubungi Kami
        </Typography>
        <Typography sx={{ color: '#b5eaff', fontSize: { xs: '1rem', md: '1.1rem' }, mb: 4, maxWidth: 700, mx: 'auto', textAlign: 'center' }}>
          Konsultasikan kebutuhan pengujian material proyek Anda dengan tim ahli kami
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(65,227,255,0.1)', height: '100%', textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>
                Alamat Kantor
              </Typography>
              <Typography sx={{ color: '#b5eaff', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Jl. Teknik Sipil No. 123<br />
                Kota Jakarta Selatan, 12345<br />
                Indonesia
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(65,227,255,0.1)', height: '100%', textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>
                Kontak
              </Typography>
              <Typography sx={{ color: '#b5eaff', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Telepon: +62 21 1234 5678<br />
                Email: info@intiteknologi.com<br />
                Jam Kerja: Senin-Jumat, 08.00-17.00
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* Footer */}
      <Box sx={{
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
        background: '#090d1f',
        borderTop: '1px solid rgba(65,227,255,0.1)',
        textAlign: 'center',
      }}>
        <Typography sx={{ color: '#b5eaff', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Inti Teknologi Pengujian Material. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing;
