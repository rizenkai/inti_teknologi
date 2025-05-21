/*
 * This file contains fixed styles for light mode support in the Dashboard.js dropdowns
 * 
 * Instructions:
 * 1. Replace the dropdown styling in Dashboard.js with these styles
 * 2. Make sure to add the isDarkMode conditional logic to all color properties
 */

// For Tipe Pengujian dropdown (around line 1377)
const tipePengujianStyles = {
  width: '100%',
  p: 1.5,
  borderRadius: 1,
  border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
  bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
  color: isDarkMode ? '#fff' : '#333',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease-in-out',
  '&:focus': {
    boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.5)' : '0 0 0 2px rgba(25,118,210,0.3)',
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.08)',
  },
  '&:hover': {
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.05)',
  },
  '& option': {
    bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
    color: isDarkMode ? '#fff' : '#333',
    padding: '8px',
  }
};

// For Mutu Bahan dropdown (around line 1470)
const mutuBahanStyles = {
  width: '100%',
  p: 1.5,
  borderRadius: 1,
  border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
  bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
  color: isDarkMode ? '#fff' : '#333',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease-in-out',
  '&:focus': {
    boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.5)' : '0 0 0 2px rgba(25,118,210,0.3)',
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.08)',
  },
  '&:hover': {
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.05)',
  },
  '& option': {
    bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
    color: isDarkMode ? '#fff' : '#333',
    padding: '8px',
  }
};

// For Tipe Bahan dropdown (around line 1539)
const tipeBahanStyles = {
  width: '100%',
  p: 1.5,
  borderRadius: 1,
  border: `1px solid ${isDarkMode ? '#41e3ff' : '#1976d2'}`,
  bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
  color: isDarkMode ? '#fff' : '#333',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease-in-out',
  '&:focus': {
    boxShadow: isDarkMode ? '0 0 0 2px rgba(65,227,255,0.5)' : '0 0 0 2px rgba(25,118,210,0.3)',
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.08)',
  },
  '&:hover': {
    bgcolor: isDarkMode ? '#102a43' : 'rgba(25,118,210,0.05)',
  },
  '& option': {
    bgcolor: isDarkMode ? '#0a1929' : '#ffffff',
    color: isDarkMode ? '#fff' : '#333',
    padding: '8px',
  }
};
