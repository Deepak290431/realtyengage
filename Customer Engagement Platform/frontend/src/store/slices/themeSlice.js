import { createSlice } from '@reduxjs/toolkit';

// Get theme from localStorage
const getInitialTheme = () => {
  const savedMode = localStorage.getItem('themeMode');
  const savedColor = localStorage.getItem('themePrimaryColor');
  const savedAutoMode = localStorage.getItem('themeAutoMode');
  const savedHighContrast = localStorage.getItem('themeHighContrast');
  const savedFontSize = localStorage.getItem('themeFontSize');

  let mode = savedMode || 'light';

  if (savedAutoMode === 'true' && !savedMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mode = prefersDark ? 'dark' : 'light';
  }

  return {
    mode,
    primaryColor: savedColor || '#1976d2',
    secondaryColor: '#dc004e',
    autoMode: savedAutoMode === 'true',
    highContrast: savedHighContrast === 'true',
    fontSize: savedFontSize || 'medium'
  };
};

const initialState = getInitialTheme();

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      state.autoMode = false;
      localStorage.setItem('themeMode', state.mode);
      localStorage.setItem('themeAutoMode', 'false');
      document.documentElement.setAttribute('data-theme', state.mode);

      // Apply theme to MUI
      if (window.updateMuiTheme) {
        window.updateMuiTheme(state.mode);
      }
    },
    setThemeMode: (state, action) => {
      const newMode = action.payload;
      state.mode = newMode;

      if (newMode === 'auto') {
        state.autoMode = true;
        localStorage.setItem('themeAutoMode', 'true');

        // Set based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.mode = prefersDark ? 'dark' : 'light';
      } else {
        state.autoMode = false;
        localStorage.setItem('themeMode', newMode);
        localStorage.setItem('themeAutoMode', 'false');
      }

      document.documentElement.setAttribute('data-theme', state.mode);

      // Apply theme to MUI
      if (window.updateMuiTheme) {
        window.updateMuiTheme(state.mode);
      }
    },
    setThemeColor: (state, action) => {
      const { primary, secondary } = action.payload;
      state.primaryColor = primary;
      if (secondary) {
        state.secondaryColor = secondary;
      }

      localStorage.setItem('themePrimaryColor', primary);
      if (secondary) {
        localStorage.setItem('themeSecondaryColor', secondary);
      }

      // Update CSS variables
      document.documentElement.style.setProperty('--primary-color', primary);
      if (secondary) {
        document.documentElement.style.setProperty('--secondary-color', secondary);
      }

      // Apply to MUI theme
      if (window.updateMuiColors) {
        window.updateMuiColors({ primary, secondary });
      }
    },
    setHighContrast: (state, action) => {
      state.highContrast = action.payload;
      localStorage.setItem('themeHighContrast', action.payload);
      document.documentElement.setAttribute('data-high-contrast', action.payload);
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('themeFontSize', action.payload);

      // Update root font size
      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      document.documentElement.style.fontSize = sizes[action.payload] || '16px';
    },
    initializeTheme: (state) => {
      // Set initial theme attributes
      document.documentElement.setAttribute('data-theme', state.mode);
      document.documentElement.style.setProperty('--primary-color', state.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', state.secondaryColor);

      if (state.highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
      }

      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      document.documentElement.style.fontSize = sizes[state.fontSize] || '16px';
    }
  }
});

export const {
  toggleTheme,
  setThemeMode,
  setThemeColor,
  setHighContrast,
  setFontSize,
  initializeTheme
} = themeSlice.actions;

export default themeSlice.reducer;
