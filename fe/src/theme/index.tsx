"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2E8B57", // Sea Green
      dark: "#246b44",
      light: "#A7D7C5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#A7D7C5",
    },
    background: {
      default: "#F9FBFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#4F4F4F",
    },
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;
