import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import theme from "theme";
import { StateProvider } from "store/store";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

// Add global styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Oswald;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StateProvider>
          <GlobalStyle />
          <App />
        </StateProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
