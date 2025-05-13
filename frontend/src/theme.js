// Custom MUI theme: Override font to Open Sans for all components
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans, Arial, Helvetica, sans-serif',
    h1: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    h2: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    h3: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    h4: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    h5: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    h6: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    subtitle1: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    subtitle2: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    body1: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    body2: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    button: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    caption: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
    overline: { fontFamily: 'Open Sans, Arial, Helvetica, sans-serif' },
  },
});

export default theme;
