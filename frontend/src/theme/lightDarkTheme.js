// lightDarkTheme.js
// File ini berisi konfigurasi tema light dan dark untuk aplikasi

// Tema dark (default)
export const darkTheme = {
  // Warna utama
  primary: {
    main: '#41e3ff',
    light: '#65e7ff',
    dark: '#1ec6e6',
    contrastText: '#111a2b'
  },
  // Warna sekunder
  secondary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff'
  },
  // Warna background
  background: {
    default: '#090d1f',
    paper: 'rgba(20,32,54,0.68)',
    card: 'rgba(20,32,54,0.82)',
    input: '#162336',
    hover: 'rgba(65,227,255,0.10)'
  },
  // Warna teks
  text: {
    primary: '#ffffff',
    secondary: '#b5eaff',
    disabled: '#6b7280',
    hint: '#bdbdbd'
  },
  // Warna border
  border: {
    main: '#41e3ff',
    light: 'rgba(65,227,255,0.5)',
    dark: 'rgba(59,130,246,0.18)'
  },
  // Warna status
  status: {
    pending: '#fbbf24',
    in_progress: '#60a5fa',
    review: '#f87171',
    completed: '#4ade80',
    error: '#ef4444'
  },
  // Gradients
  gradients: {
    primary: 'radial-gradient(ellipse at 60% 40%, rgba(65,227,255,0.18) 0%, rgba(59,130,246,0.16) 40%, rgba(9,13,31,0.8) 100%)',
    button: 'linear-gradient(90deg, #41e3ff 0%, #1ec6e6 100%)',
    buttonHover: 'linear-gradient(90deg, #1ec6e6 0%, #41e3ff 100%)'
  },
  // Shadows
  shadows: {
    button: '0 2px 8px 0 rgba(65,227,255,0.12)',
    card: '0 2px 16px rgba(65,227,255,0.18)',
    input: '0 1px 4px 0 rgba(65,227,255,0.12)'
  }
};

// Tema light
export const lightTheme = {
  // Warna utama
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  // Warna sekunder
  secondary: {
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff'
  },
  // Warna background
  background: {
    default: '#f7f7f7',
    paper: 'rgba(255,255,255,0.9)',
    card: 'rgba(255,255,255,0.95)',
    input: '#ffffff',
    hover: 'rgba(25,118,210,0.10)'
  },
  // Warna teks
  text: {
    primary: '#333333',
    secondary: '#1976d2',
    disabled: '#9e9e9e',
    hint: '#757575'
  },
  // Warna border
  border: {
    main: '#1976d2',
    light: 'rgba(25,118,210,0.5)',
    dark: 'rgba(25,118,210,0.18)'
  },
  // Warna status
  status: {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    review: '#ef4444',
    completed: '#10b981',
    error: '#dc2626'
  },
  // Gradients
  gradients: {
    primary: 'radial-gradient(ellipse at 60% 40%, rgba(65,227,255,0.18) 0%, rgba(59,130,246,0.16) 40%, rgba(247,247,247,0.8) 100%)',
    button: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
    buttonHover: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)'
  },
  // Shadows
  shadows: {
    button: '0 2px 8px 0 rgba(25,118,210,0.12)',
    card: '0 2px 16px rgba(0,0,0,0.10)',
    input: '0 1px 4px 0 rgba(25,118,210,0.12)'
  }
};

// Fungsi untuk mendapatkan tema berdasarkan mode
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Fungsi untuk mendapatkan warna status berdasarkan status dan mode
export const getStatusColor = (status, isDarkMode) => {
  const theme = getTheme(isDarkMode);
  return theme.status[status] || theme.text.disabled;
};

// Fungsi untuk mendapatkan warna teks kontras berdasarkan status
export const getStatusTextColor = (status) => {
  // Warna teks untuk status yang membutuhkan teks gelap
  const darkTextStatus = ['pending', 'completed'];
  return darkTextStatus.includes(status) ? '#212121' : '#ffffff';
};

export default getTheme;
