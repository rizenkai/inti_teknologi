import React, { createContext, useState, useContext, useEffect } from 'react';

// Membuat context untuk tema
const ThemeContext = createContext();

// Provider untuk tema
export const ThemeProvider = ({ children }) => {
  // Mengambil preferensi tema dari localStorage atau default ke light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false; // Default ke light mode jika tidak ada preferensi
  });

  // Menyimpan perubahan tema ke localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook untuk menggunakan tema
export const useTheme = () => useContext(ThemeContext);
