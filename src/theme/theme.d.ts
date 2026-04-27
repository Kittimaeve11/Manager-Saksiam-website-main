import '@mui/material/styles';
import '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {

  interface TypeText {
    primaryChannel: string;
  }
     interface TypeBackground {
    neutral: string;
  }

  interface CustomShadows {
    z1: string
    z4: string
    z8: string
    z12: string
    z16: string
    z20: string
    z24: string
    dialog: string
    card: string
    dropdown: string
    primary: string
    secondary: string
    info: string
    success: string
    warning: string
    error: string
  }

  interface Theme {
    customShadows: CustomShadows
  }

  interface ThemeOptions {
    customShadows?: CustomShadows
  }

  interface CssVarsThemeOptions {
    customShadows?: CustomShadows
  }
}


declare module '@mui/material/styles/createPalette' {

 

  interface Color {
    '50Channel'?: string
    '100Channel'?: string
    '200Channel'?: string
    '300Channel'?: string
    '400Channel'?: string
    '500Channel'?: string
    '600Channel'?: string 
    '700Channel'?: string
    '800Channel'?: string
    '900Channel'?: string
  }

}
