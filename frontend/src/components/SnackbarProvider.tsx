import * as React from 'react';
import {SnackbarProvider as NotisnackProvider, SnackbarProviderProps} from 'notistack';
import {IconButton, makeStyles, Theme} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme: Theme) => {
    return {
        root: {
            pointerEvents: 'all', // this avoid the problem where the click does not reach the snackbar
        },
        variantSuccess: {
            backgroundColor: theme.palette.success.main
        },
        variantError: {
            backgroundColor: theme.palette.error.main
        },
        variantInfo: {
            backgroundColor: theme.palette.primary.main
        }
    }
});

export const  SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {
    let snackbarProviderRef:any;
    const classes = useStyles();
    const defaultProps: SnackbarProviderProps = {
        classes,
        autoHideDuration: 3000,
        maxSnack: 3,
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
        },
        preventDuplicate: true,
        ref: (el) => snackbarProviderRef = el,
        action: (key) => (
            <IconButton 
                color={"inherit"} 
                style={{fontSize:20}}
                onClick={() => {snackbarProviderRef.closeSnackbar(key)}}
            >
                <CloseIcon />
            </IconButton>
        ),
        children: props.children
    }

    const newProps = {...defaultProps, ...props};

    return (
        <NotisnackProvider className={classes.root} {...newProps}>
            {props.children}
        </NotisnackProvider>
    );
}
