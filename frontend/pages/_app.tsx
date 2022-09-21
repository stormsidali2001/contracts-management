import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material'
import { theme } from '../theme'
import { Provider } from 'react-redux'
import {store} from '../store';
import WithPrivate from '../features/auth/components/withPrivate'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function MyApp({ Component, pageProps }: AppProps) {
  return ( 
    <Provider store={store}>
     <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <WithPrivate>
          <Component {...pageProps} />
          </WithPrivate>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
    )
   
  
}

export default MyApp
