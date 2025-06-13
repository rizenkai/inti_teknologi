import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Container, Card, CardContent, CardMedia, Divider, useTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaFlask, FaTools, FaHardHat, FaAward, FaChartLine, FaArrowRight, FaBars } from 'react-icons/fa';
import { useTheme as useAppTheme } from '../context/ThemeContext';

// Layanan pengujian yang ditawarkan
const services = [
  {
    title: 'Pengujian Beton',
    desc: 'Pengujian kuat tekan, slump test, dan analisis komposisi beton untuk memastikan kualitas dan keamanan struktur.',
    icon: <FaBuilding size={38} color="#b5eaff" style={{ marginBottom: 12 }} />,
  },
  {
    title: 'Pengujian Besi',
    desc: 'Uji tarik, kekerasan, dan komposisi material besi untuk memastikan kekuatan dan daya tahan.',
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
  // eslint-disable-next-line no-unused-vars
  const muiTheme = useTheme();
  const { isDarkMode } = useAppTheme();
  
  // Referensi untuk setiap section
  const programRef = useRef(null);
  const contactRef = useRef(null);
  
  // Fungsi untuk scroll ke section tertentu
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  // State untuk dialog layanan
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // State untuk dialog program
  const [openBetonDialog, setOpenBetonDialog] = useState(false);
  
  // State untuk mobile drawer menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openBesiDialog, setOpenBesiDialog] = useState(false);
  
  // Fungsi untuk membuka drawer menu mobile
  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  // Fungsi untuk menutup drawer menu mobile
  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Fungsi untuk membuka dialog layanan
  const handleOpenServiceDialog = (service) => {
    setSelectedService(service);
    setOpenServiceDialog(true);
  };

  // Fungsi untuk menutup dialog layanan
  const handleCloseServiceDialog = () => {
    setOpenServiceDialog(false);
  };
  
  // Fungsi untuk membuka dialog program beton
  const handleOpenBetonDialog = () => {
    setOpenBetonDialog(true);
  };
  
  // Fungsi untuk menutup dialog program beton
  const handleCloseBetonDialog = () => {
    setOpenBetonDialog(false);
  };
  
  // Fungsi untuk membuka dialog program besi
  const handleOpenBesiDialog = () => {
    setOpenBesiDialog(true);
  };
  
  // Fungsi untuk menutup dialog program besi
  const handleCloseBesiDialog = () => {
    setOpenBesiDialog(false);
  };
  
  // Warna tema untuk landing page
  const themeColors = {
    primary: isDarkMode ? '#41e3ff' : '#1976d2',
    background: isDarkMode ? '#090d1f' : '#ffffff',
    cardBg: isDarkMode ? 'rgba(16,24,40,0.5)' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#333333',
    secondaryText: isDarkMode ? '#b5eaff' : '#666666',
    border: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(0,0,0,0.1)',
    buttonBg: isDarkMode ? '#41e3ff' : '#1976d2',
    buttonText: isDarkMode ? '#090d1f' : '#ffffff',
    headerBg: isDarkMode ? 'rgba(9,13,31,0.8)' : 'rgba(255,255,255,0.9)',
  };
  
  return (
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
        color: themeColors.text,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: themeColors.background,
        '&::-webkit-scrollbar': {
          width: 6,
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 3,
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} transparent`,
      }}>
      {/* Header/Navigation */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: themeColors.headerBg,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${themeColors.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        py: 1.5,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <img src="/logo.png" alt="Inti Teknologi Logo" style={{ height: '40px', marginRight: '12px' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: themeColors.primary }}>
                INTI TEKNOLOGI INDONESIA
              </Typography>
            </Box>
            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button sx={{ color: themeColors.text, fontWeight: 600 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Beranda</Button>
              <Button sx={{ color: themeColors.text, fontWeight: 600 }} onClick={() => scrollToSection(programRef)}>Program Kami</Button>
              <Button sx={{ color: themeColors.text, fontWeight: 600 }} onClick={() => scrollToSection(contactRef)}>Kontak</Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/intidocs/login')} 
                sx={{ 
                  bgcolor: themeColors.buttonBg,
                  color: themeColors.buttonText,
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: isDarkMode ? '#1ec6e6' : '#1565c0',
                  }
                }}
              >
                Masuk
              </Button>
            </Box>
            
            {/* Mobile Menu Button */}
            <IconButton 
              sx={{ display: { xs: 'flex', md: 'none' }, color: themeColors.text }} 
              onClick={handleOpenMobileMenu}
            >
              <FaBars />
            </IconButton>
          </Box>
        </Container>
      </Box>
      
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 300,
            bgcolor: themeColors.background,
            borderLeft: `1px solid ${themeColors.border}`,
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: `1px solid ${themeColors.border}`, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <img src="/logo.png" alt="Inti Teknologi Logo" style={{ height: '32px', marginRight: '12px' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: themeColors.primary }}>
            INTI TEKNOLOGI
          </Typography>
        </Box>
        <List>
          <ListItem button onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            handleCloseMobileMenu();
          }}>
            <ListItemText primary="Beranda" sx={{ color: themeColors.text }} />
          </ListItem>
          <ListItem button onClick={() => {
            scrollToSection(programRef);
            handleCloseMobileMenu();
          }}>
            <ListItemText primary="Program Kami" sx={{ color: themeColors.text }} />
          </ListItem>
          <ListItem button onClick={() => {
            scrollToSection(contactRef);
            handleCloseMobileMenu();
          }}>
            <ListItemText primary="Kontak" sx={{ color: themeColors.text }} />
          </ListItem>
          <ListItem button onClick={() => {
            navigate('/intidocs/login');
            handleCloseMobileMenu();
          }}>
            <ListItemText 
              primary="Masuk" 
              sx={{ 
                color: themeColors.primary,
                '& .MuiTypography-root': {
                  fontWeight: 700
                }
              }} 
            />
          </ListItem>
        </List>
      </Drawer>

      {/* Hero Section */}
      <Box sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url('/new-hero-image.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top', // Posisi gambar di atas
        display: 'flex',
        alignItems: 'center',
        mt: '-64px', // Kompensasi untuk tinggi header
        pt: '64px', // Tambahkan padding top agar konten tidak tertutup header
        boxSizing: 'border-box',
        maxWidth: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? 'rgba(9,13,31,0.85)' : 'rgba(0,0,0,0.65)',
          zIndex: 1
        }
      }}>
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2, py: { xs: 8, md: 10 }, width: '100%', px: { xs: 3, md: 6, lg: 10 } }}>
          <Box sx={{ 
            maxWidth: { xs: '100%', md: '60%', lg: '50%' },
            ml: { xs: 0, md: 0 },
            textAlign: { xs: 'center', md: 'left' },
            px: { xs: 2, md: 0 }
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                color: '#ffffff', 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              Jelajahi Layanan Pengujian Material Kami
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 4,
                maxWidth: 600,
                mx: { xs: 'auto', md: 0 },
                textShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              Kami menyediakan pengujian material konstruksi berkualitas tinggi dengan teknologi terkini dan tim ahli berpengalaman untuk memastikan kualitas proyek Anda
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/login')} 
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 2, 
                  fontWeight: 700,
                  bgcolor: themeColors.primary,
                  color: isDarkMode ? '#090d1f' : '#ffffff',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#1ec6e6' : '#1565c0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                Masuk ke Dashboard
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 2, 
                  fontWeight: 700,
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => scrollToSection(programRef)}
              >
                Pelajari Layanan
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services section */}
      <Box sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: isDarkMode ? 'rgba(9,13,31,0.97)' : '#f8f9fa',
        position: 'relative',
        borderTop: `1px solid ${themeColors.border}`,
        borderBottom: `1px solid ${themeColors.border}`,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              fontWeight: 700, 
              fontSize: { xs: '1.8rem', md: '2.5rem' }, 
              mb: 2, 
              color: themeColors.primary 
            }}>
              Jelajahi Program Layanan Kami
            </Typography>
            <Typography sx={{ 
              color: themeColors.secondaryText, 
              fontSize: { xs: '1rem', md: '1.1rem' }, 
              mb: 2, 
              maxWidth: 700, 
              mx: 'auto', 
              textAlign: 'center' 
            }}>
              Temukan berbagai program dan layanan pengujian material konstruksi dengan standar tertinggi
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  backgroundColor: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }
                }}>
                  <CardMedia
                    component="div"
                    sx={{
                      width: { xs: '100%', sm: 200 },
                      height: { xs: 200, sm: 'auto' },
                      backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ p: 4 }}>
                      {service.icon}
                    </Box>
                  </CardMedia>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: themeColors.text }}>
                      {service.title}
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.95rem', lineHeight: 1.7, mb: 2 }}>
                      {service.desc}
                    </Typography>
                    <Button 
                      endIcon={<FaArrowRight />}
                      onClick={() => handleOpenServiceDialog(service)}
                      sx={{ 
                        color: themeColors.primary, 
                        fontWeight: 600,
                        p: 0,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          opacity: 0.8,
                        }
                      }}
                    >
                      Lihat Detail
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Program Unggulan section */}
      <Box ref={programRef} sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: themeColors.background,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              fontWeight: 700, 
              fontSize: { xs: '1.8rem', md: '2.5rem' }, 
              mb: 2, 
              color: themeColors.primary 
            }}>
              Program Unggulan Kami
            </Typography>
            <Typography sx={{ 
              color: themeColors.secondaryText, 
              fontSize: { xs: '1rem', md: '1.1rem' }, 
              mb: 2, 
              maxWidth: 700, 
              mx: 'auto', 
              textAlign: 'center' 
            }}>
              Temukan program unggulan yang kami tawarkan untuk memastikan kualitas material konstruksi Anda
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                height: '100%',
                backgroundColor: themeColors.cardBg,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image="/concrete-testing.jpg"
                    alt="Pengujian Beton"
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    left: 16, 
                    bgcolor: themeColors.primary,
                    color: isDarkMode ? '#090d1f' : '#ffffff',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}>
                    Program / Pengujian Beton
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: themeColors.text }}>
                    Pengujian Kualitas Beton Terpadu
                  </Typography>
                  <Typography sx={{ color: themeColors.secondaryText, mb: 3, lineHeight: 1.7 }}>
                    Di INTI TEKNOLOGI, kami memahami bahwa pengujian beton yang akurat adalah kunci untuk memastikan kualitas dan keamanan struktur bangunan. Program pengujian beton kami dirancang untuk memberikan hasil yang presisi dengan didukung oleh teknologi terkini dan tim ahli yang berpengalaman.
                  </Typography>
                  <Button 
                    variant="outlined"
                    endIcon={<FaArrowRight />}
                    onClick={handleOpenBetonDialog}
                    sx={{ 
                      borderColor: themeColors.primary,
                      color: themeColors.primary,
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        borderColor: themeColors.primary,
                        backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
                      }
                    }}
                  >
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                height: '100%',
                backgroundColor: themeColors.cardBg,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image="/steel-testing.jpg"
                    alt="Pengujian Besi"
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    left: 16, 
                    bgcolor: themeColors.primary,
                    color: isDarkMode ? '#090d1f' : '#ffffff',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}>
                    Program / Pengujian Besi
                  </Box>
                </Box>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: themeColors.text }}>
                    Analisis Kekuatan Besi
                  </Typography>
                  <Typography sx={{ color: themeColors.secondaryText, mb: 3, lineHeight: 1.7, flex: 1 }}>
                    Program pengujian besi kami menawarkan analisis komprehensif untuk memastikan material memenuhi standar kekuatan dan daya tahan yang diperlukan.
                  </Typography>
                  <Button 
                    variant="outlined"
                    endIcon={<FaArrowRight />}
                    onClick={handleOpenBesiDialog}
                    sx={{ 
                      borderColor: themeColors.primary,
                      color: themeColors.primary,
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      alignSelf: 'flex-start',
                      '&:hover': {
                        borderColor: themeColors.primary,
                        backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
                      }
                    }}
                  >
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* Footer */}
      <Box ref={contactRef} sx={{
        pt: 8,
        pb: 4,
        backgroundColor: themeColors.background,
        borderTop: `1px solid ${themeColors.border}`,
        mt: 6
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 4 }}>
            {/* Logo dan Deskripsi */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              mb: { xs: 4, md: 0 },
              maxWidth: { xs: '100%', md: '40%' }
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
                INTI TEKNOLOGI
              </Typography>
              <Typography sx={{ color: themeColors.secondaryText, mb: 3, lineHeight: 1.7, textAlign: { xs: 'center', md: 'left' } }}>
                Laboratorium pengujian material konstruksi terkemuka dengan teknologi terkini dan tim ahli berpengalaman.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'row' }, justifyContent: 'space-between', flex: 1 }}>
              {/* Menu Umum */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                mr: { xs: 0, md: 4 }
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColors.text, mb: 3, textAlign: 'center' }}>
                  Umum
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                  <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ color: themeColors.secondaryText, p: 0 }}>Beranda</Button>
                  <Button onClick={() => scrollToSection(programRef)} sx={{ color: themeColors.secondaryText, p: 0 }}>Program Kami</Button>
                  <Button onClick={() => scrollToSection(contactRef)} sx={{ color: themeColors.secondaryText, p: 0 }}>Kontak</Button>
                </Box>
              </Box>
              
              {/* Ikuti Kami */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColors.text, mb: 3, textAlign: 'center' }}>
                  Ikuti Kami
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                  <Button 
                    onClick={() => window.open('https://facebook.com', '_blank')} 
                    sx={{ color: themeColors.secondaryText, p: 0 }}
                  >
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => window.open('https://twitter.com', '_blank')} 
                    sx={{ color: themeColors.secondaryText, p: 0 }}
                  >
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => window.open('https://linkedin.com', '_blank')} 
                    sx={{ color: themeColors.secondaryText, p: 0 }}
                  >
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={() => window.open('https://instagram.com', '_blank')} 
                    sx={{ color: themeColors.secondaryText, p: 0 }}
                  >
                    Instagram
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4, width: '100%', borderColor: themeColors.border }} />
          <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} PT Inti Teknologi Indonesia All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Dialog untuk layanan */}
      {/* Mobile Menu Drawer */}
      

      <Dialog
        open={openServiceDialog}
        onClose={handleCloseServiceDialog}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: themeColors.cardBg,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        {selectedService && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `1px solid ${themeColors.border}`,
              py: 2,
              px: 3,
              color: themeColors.text,
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              {selectedService.title}
            </DialogTitle>
            <DialogContent sx={{ py: 3, px: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ mr: 3 }}>
                  {selectedService.icon}
                </Box>
                <DialogContentText sx={{ color: themeColors.secondaryText, fontSize: '1.1rem' }}>
                  {selectedService.desc}
                </DialogContentText>
              </Box>
              
              <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2, mt: 3 }}>
                Manfaat Layanan
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Kualitas Terjamin
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText }}>
                      Hasil pengujian yang akurat dan dapat diandalkan dengan standar internasional.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Efisiensi Waktu
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText }}>
                      Proses pengujian yang cepat dengan hasil yang dapat diakses secara digital.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2, mt: 3 }}>
                Proses Pengujian
              </Typography>
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                mb: 3
              }}>
                <Typography sx={{ color: themeColors.secondaryText, mb: 2 }}>
                  Proses pengujian dilakukan dengan tahapan berikut:
                </Typography>
                <Box component="ol" sx={{ pl: 2, color: themeColors.secondaryText }}>
                  <Box component="li" sx={{ mb: 1 }}>Pengambilan sampel material</Box>
                  <Box component="li" sx={{ mb: 1 }}>Persiapan dan pemrosesan sampel</Box>
                  <Box component="li" sx={{ mb: 1 }}>Pengujian dengan peralatan terkalibrasi</Box>
                  <Box component="li" sx={{ mb: 1 }}>Analisis hasil pengujian</Box>
                  <Box component="li">Pelaporan hasil dengan dokumentasi lengkap</Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${themeColors.border}` }}>
              <Button 
                variant="outlined"
                onClick={handleCloseServiceDialog} 
                sx={{ 
                  borderColor: themeColors.primary,
                  color: themeColors.primary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: themeColors.primary,
                    backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
                  }
                }}
              >
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog untuk program beton */}
      <Dialog
        open={openBetonDialog}
        onClose={handleCloseBetonDialog}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: themeColors.cardBg,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${themeColors.border}`,
          py: 2,
          px: 3,
          color: themeColors.text,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          Pengujian Kualitas Beton Terpadu
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3, 
            mb: 3,
            alignItems: { xs: 'center', md: 'flex-start' }
          }}>
            <Box 
              component="img"
              src="/concrete-testing.jpg"
              alt="Pengujian Beton"
              sx={{ 
                width: { xs: '100%', md: 300 },
                height: 'auto',
                borderRadius: 2,
                objectFit: 'cover',
              }}
            />
            <Box>
              <DialogContentText sx={{ color: themeColors.secondaryText, fontSize: '1.1rem', mb: 2 }}>
                Di INTI TEKNOLOGI, kami memahami bahwa pengujian beton yang akurat adalah kunci untuk memastikan kualitas dan keamanan struktur bangunan. Program pengujian beton kami dirancang untuk memberikan hasil yang presisi dengan didukung oleh teknologi terkini dan tim ahli yang berpengalaman.
              </DialogContentText>
              
              <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2 }}>
                Jenis Pengujian Beton
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Uji Kuat Tekan
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                      Menguji kemampuan beton untuk menahan beban kompresi.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Slump Test
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                      Mengukur konsistensi dan workability beton segar.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          
          <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2, mt: 3 }}>
            Standar Pengujian
          </Typography>
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: `1px solid ${themeColors.border}`,
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            mb: 3
          }}>
            <Typography sx={{ color: themeColors.secondaryText, mb: 2 }}>
              Semua pengujian beton kami mengikuti standar berikut:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: themeColors.secondaryText }}>
              <Box component="li" sx={{ mb: 1 }}>SNI 1974:2011 - Cara uji kuat tekan beton</Box>
              <Box component="li" sx={{ mb: 1 }}>SNI 1972:2008 - Cara uji slump beton</Box>
              <Box component="li" sx={{ mb: 1 }}>ASTM C39 - Standard Test Method for Compressive Strength</Box>
              <Box component="li">ASTM C143 - Standard Test Method for Slump of Hydraulic-Cement Concrete</Box>
            </Box>
          </Box>
          
          <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2 }}>
            Peralatan Pengujian
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Compression Testing Machine
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Mesin pengujian kuat tekan dengan kapasitas hingga 3000 kN.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Slump Cone Set
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Peralatan standar untuk pengujian slump beton segar.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Concrete Curing Chamber
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Ruang perawatan beton dengan suhu dan kelembaban terkontrol.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${themeColors.border}` }}>
          <Button 
            variant="outlined"
            onClick={handleCloseBetonDialog} 
            sx={{ 
              borderColor: themeColors.primary,
              color: themeColors.primary,
              fontWeight: 600,
              '&:hover': {
                borderColor: themeColors.primary,
                backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
              }
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog untuk program besi */}
      <Dialog
        open={openBesiDialog}
        onClose={handleCloseBesiDialog}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: themeColors.cardBg,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${themeColors.border}`,
          py: 2,
          px: 3,
          color: themeColors.text,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          Analisis Kekuatan Besi
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3, 
            mb: 3,
            alignItems: { xs: 'center', md: 'flex-start' }
          }}>
            <Box 
              component="img"
              src="/steel-testing.jpg"
              alt="Pengujian Besi"
              sx={{ 
                width: { xs: '100%', md: 300 },
                height: 'auto',
                borderRadius: 2,
                objectFit: 'cover',
              }}
            />
            <Box>
              <DialogContentText sx={{ color: themeColors.secondaryText, fontSize: '1.1rem', mb: 2 }}>
                Program pengujian besi kami menawarkan analisis komprehensif untuk memastikan material memenuhi standar kekuatan dan daya tahan yang diperlukan. Dengan peralatan modern dan metode pengujian terkini, kami memberikan hasil yang akurat dan dapat diandalkan.
              </DialogContentText>
              
              <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2 }}>
                Jenis Pengujian Besi
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Uji Tarik
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                      Mengukur kekuatan tarik, batas elastis, dan elongasi material besi.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `1px solid ${themeColors.border}`,
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                      Uji Kekerasan
                    </Typography>
                    <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                      Mengukur tingkat kekerasan material dengan metode Brinell, Rockwell, atau Vickers.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          
          <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2, mt: 3 }}>
            Standar Pengujian
          </Typography>
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: `1px solid ${themeColors.border}`,
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            mb: 3
          }}>
            <Typography sx={{ color: themeColors.secondaryText, mb: 2 }}>
              Semua pengujian besi kami mengikuti standar berikut:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: themeColors.secondaryText }}>
              <Box component="li" sx={{ mb: 1 }}>SNI 07-2529-1991 - Metode pengujian kuat tarik baja beton</Box>
              <Box component="li" sx={{ mb: 1 }}>ASTM A370 - Standard Test Methods and Definitions for Mechanical Testing of Steel Products</Box>
              <Box component="li" sx={{ mb: 1 }}>ASTM E10 - Standard Test Method for Brinell Hardness of Metallic Materials</Box>
              <Box component="li">ASTM E18 - Standard Test Methods for Rockwell Hardness of Metallic Materials</Box>
            </Box>
          </Box>
          
          <Typography variant="h6" sx={{ color: themeColors.text, fontWeight: 700, mb: 2 }}>
            Parameter Pengujian
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Kekuatan Tarik
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Mengukur beban maksimum yang dapat ditahan material sebelum patah.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Batas Elastis
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Titik di mana material mulai mengalami deformasi permanen.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${themeColors.border}`,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                height: '100%',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Elongasi
                </Typography>
                <Typography sx={{ color: themeColors.secondaryText, fontSize: '0.9rem' }}>
                  Persentase pertambahan panjang material sebelum patah.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${themeColors.border}` }}>
          <Button 
            variant="outlined"
            onClick={handleCloseBesiDialog} 
            sx={{ 
              borderColor: themeColors.primary,
              color: themeColors.primary,
              fontWeight: 600,
              '&:hover': {
                borderColor: themeColors.primary,
                backgroundColor: isDarkMode ? 'rgba(65,227,255,0.1)' : 'rgba(25,118,210,0.1)',
              }
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Landing;
