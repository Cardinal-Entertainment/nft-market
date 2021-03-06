import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import App from './App'
import theme from 'theme'
import { StateProvider } from 'store/store'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'

import { BrowserRouter as Router } from 'react-router-dom'

// import { ReactQueryDevtools } from 'react-query/devtools'

// Add global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Oswald;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

const queryClient = new QueryClient()

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StateProvider>
            <GlobalStyle />
            <Router>
              <App />
            </Router>
          </StateProvider>
        </LocalizationProvider>
      </ThemeProvider>
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
