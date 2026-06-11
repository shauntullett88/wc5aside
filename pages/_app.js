import '../styles/globals.css';
import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(true);

  // Persist theme to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wc5a-theme');
    if (saved !== null) setDark(saved === 'dark');
  }, []);

  function toggle() {
    setDark(d => {
      localStorage.setItem('wc5a-theme', !d ? 'dark' : 'light');
      return !d;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'dark' : 'light'}>
        <Component {...pageProps} />
      </div>
    </ThemeContext.Provider>
  );
}
