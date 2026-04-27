import { createTheme as muiCreateTheme } from '@mui/material/styles';
import type { CssVarsThemeOptions, Theme } from '@mui/material/styles';
import { shadows, typography, components, colorSchemes, customShadows } from './core';


// ----------------------------------------------------------------------

export function createTheme(): Theme {
    const initialTheme: CssVarsThemeOptions = {
      colorSchemes,
      shadows: shadows(),
      customShadows: customShadows(),
      shape: { borderRadius: 8 },
      components,
      typography,
      cssVarPrefix: '', // Optionally, set a custom prefix for CSS variables
      shouldSkipGeneratingVar,
    };
  
    const theme = muiCreateTheme(initialTheme); // Correctly passing CssVarsThemeOptions
  
    return theme;
  }
  
  

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys: string[]): boolean {
    const skipGlobalKeys = [
      'mixins',
      'overlays',
      'direction',
      'typography',
      'breakpoints',
      'transitions',
      'cssVarPrefix',
      'unstable_sxConfig',
    ];
  
    const skipPaletteKeys: {
      [key: string]: string[];
    } = {
      global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
      grey: ['A100', 'A200', 'A400', 'A700'],
      text: ['icon'],
    };
  
    const isPaletteKey = keys[0] === 'palette';
  
    if (isPaletteKey) {
      const paletteType = keys[1];
      const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;
  
      return keys.some((key) => skipKeys?.includes(key));
    }
  
    return keys.some((key) => skipGlobalKeys?.includes(key));
  }
  