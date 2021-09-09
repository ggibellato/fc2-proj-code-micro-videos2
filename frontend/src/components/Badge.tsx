import { Chip, MuiThemeProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import theme from "../theme";

const localTheme = createTheme({
    palette: {
        primary: theme.palette.success,
        secondary: theme.palette.error,
    }
})

export const BadgeYes = () => {
    return (
        <MuiThemeProvider theme = {localTheme}>
            <Chip label="Sim" color="primary" />    
        </MuiThemeProvider>
    );
};

export const BadgeNo = () => {
    return (
        <MuiThemeProvider theme = {localTheme}>
            <Chip label="Nao" color="secondary" />
        </MuiThemeProvider>
    );
};