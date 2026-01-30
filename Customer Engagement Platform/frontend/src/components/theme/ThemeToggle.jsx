import React from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  BrightnessAuto,
  Palette,
  FormatColorFill,
  Contrast,
  TextFields,
  CheckCircle
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setThemeMode, setThemeColor } from '../../store/slices/themeSlice';

const themeColors = [
  { name: 'Blue', primary: '#1976d2', secondary: '#dc004e' },
  { name: 'Green', primary: '#2e7d32', secondary: '#ed6c02' },
  { name: 'Purple', primary: '#7b1fa2', secondary: '#0288d1' },
  { name: 'Orange', primary: '#ed6c02', secondary: '#2e7d32' },
  { name: 'Teal', primary: '#00796b', secondary: '#c2185b' },
  { name: 'Indigo', primary: '#3949ab', secondary: '#f57c00' }
];

const ThemeToggle = ({ showLabel = false, position = 'bottom' }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mode, primaryColor, autoMode, highContrast, fontSize } = useSelector((state) => state.theme);

  const handleClick = (event) => {
    if (event.shiftKey) {
      // Quick toggle with shift key
      dispatch(toggleTheme());
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAdvancedOpen(false);
  };

  const handleModeChange = (newMode) => {
    dispatch(setThemeMode(newMode));
    if (newMode !== 'auto') {
      localStorage.setItem('themeMode', newMode);
    }
    handleClose();
  };

  const handleColorChange = (color) => {
    dispatch(setThemeColor(color));
    localStorage.setItem('themePrimaryColor', color.primary);
    handleClose();
  };

  const handleAutoMode = (enabled) => {
    if (enabled) {
      dispatch(setThemeMode('auto'));
      localStorage.setItem('themeMode', 'auto');
      // Set theme based on system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch(setThemeMode(systemPrefersDark ? 'dark' : 'light'));
    } else {
      dispatch(setThemeMode(mode === 'dark' ? 'light' : 'dark'));
      localStorage.removeItem('themeMode');
    }
  };

  const getIcon = () => {
    if (autoMode) return <BrightnessAuto />;
    return mode === 'dark' ? <Brightness7 /> : <Brightness4 />;
  };

  const getLabel = () => {
    if (autoMode) return 'Auto';
    return mode === 'dark' ? 'Light Mode' : 'Dark Mode';
  };

  return (
    <>
      <Tooltip title={`Theme Settings (${mode} mode)`}>
        {showLabel ? (
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            {getIcon()}
            <Typography variant="body2">{getLabel()}</Typography>
          </Box>
        ) : (
          <IconButton onClick={handleClick} color="inherit">
            {getIcon()}
          </IconButton>
        )}
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{
          horizontal: position === 'right' ? 'right' : 'left',
          vertical: 'top'
        }}
        anchorOrigin={{
          horizontal: position === 'right' ? 'right' : 'left',
          vertical: 'bottom'
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Theme Settings
          </Typography>
          
          {/* Theme Mode Selection */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Mode
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Paper
              onClick={() => handleModeChange('light')}
              sx={{
                flex: 1,
                p: 2,
                cursor: 'pointer',
                textAlign: 'center',
                border: mode === 'light' && !autoMode ? '2px solid' : '1px solid',
                borderColor: mode === 'light' && !autoMode ? 'primary.main' : 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Brightness7 color={mode === 'light' && !autoMode ? 'primary' : 'action'} />
              <Typography variant="caption" display="block">
                Light
              </Typography>
            </Paper>
            
            <Paper
              onClick={() => handleModeChange('dark')}
              sx={{
                flex: 1,
                p: 2,
                cursor: 'pointer',
                textAlign: 'center',
                border: mode === 'dark' && !autoMode ? '2px solid' : '1px solid',
                borderColor: mode === 'dark' && !autoMode ? 'primary.main' : 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Brightness4 color={mode === 'dark' && !autoMode ? 'primary' : 'action'} />
              <Typography variant="caption" display="block">
                Dark
              </Typography>
            </Paper>
            
            <Paper
              onClick={() => handleAutoMode(!autoMode)}
              sx={{
                flex: 1,
                p: 2,
                cursor: 'pointer',
                textAlign: 'center',
                border: autoMode ? '2px solid' : '1px solid',
                borderColor: autoMode ? 'primary.main' : 'divider',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <BrightnessAuto color={autoMode ? 'primary' : 'action'} />
              <Typography variant="caption" display="block">
                Auto
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Color Selection */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Primary Color
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
            {themeColors.map((color) => (
              <Paper
                key={color.name}
                onClick={() => handleColorChange(color)}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: primaryColor === color.primary ? '2px solid' : '1px solid',
                  borderColor: primaryColor === color.primary ? color.primary : 'divider',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: color.primary,
                    mx: 'auto',
                    mb: 0.5
                  }}
                />
                <Typography variant="caption">
                  {color.name}
                </Typography>
                {primaryColor === color.primary && (
                  <CheckCircle
                    sx={{
                      fontSize: 12,
                      ml: 0.5,
                      color: color.primary,
                      verticalAlign: 'middle'
                    }}
                  />
                )}
              </Paper>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Advanced Options */}
          <Box
            onClick={() => setAdvancedOpen(!advancedOpen)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              mb: 1
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Advanced Options
            </Typography>
            {advancedOpen ? <ExpandLess /> : <ExpandMore />}
          </Box>
          
          {advancedOpen && (
            <Box sx={{ pl: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={highContrast}
                    onChange={(e) => {
                      // dispatch(setHighContrast(e.target.checked));
                      localStorage.setItem('themeHighContrast', e.target.checked);
                    }}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Contrast fontSize="small" />
                    <Typography variant="body2">High Contrast</Typography>
                  </Box>
                }
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Font Size
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {['small', 'medium', 'large'].map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      size="small"
                      onClick={() => {
                        // dispatch(setFontSize(size));
                        localStorage.setItem('themeFontSize', size);
                      }}
                      color={fontSize === size ? 'primary' : 'default'}
                      variant={fontSize === size ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Palette />
          </ListItemIcon>
          <ListItemText>
            Custom Theme
            <Typography variant="caption" display="block" color="text.secondary">
              Coming soon...
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;
