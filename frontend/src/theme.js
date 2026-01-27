import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const baseTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0D6EFD",
            dark: "#0B5ED7",
            light: "#E3F2FD",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#2EB67D",
        },
        background: {
            default: "#F5F7FB",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0F1D3B",
            secondary: "#42526E",
        },
    },
    typography: {
        fontFamily: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 14 },
});

const theme = responsiveFontSizes(baseTheme);

export default theme;
