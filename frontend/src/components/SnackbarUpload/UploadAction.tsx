import { Fade, IconButton, ListItemSecondaryAction, makeStyles, Theme } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import ErrorIcon from '@material-ui/icons/Error';
import React, {useEffect, useState} from 'react';
import {Upload} from '../../store/upload/types';
import {hasError, isFinished} from '../../store/upload/getters';
import {useDispatch} from "react-redux";
import {Creators}  from '../../store/upload';
import {useDebounce} from "use-debounce";

const useStyles = makeStyles( (theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main
    },
    errorIcon: {
        color: theme.palette.error.main
    },
}));

interface UploadActionProps {
    upload: Upload;
    hover: boolean;
}

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const {upload, hover} = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [debouncedShow] = useDebounce(show, 2500);
    const error = hasError(upload);

    useEffect( () => {
        setShow(isFinished(upload))
    }, [upload])

    return (
        debouncedShow 
            ? (<Fade in={true} timeout={{enter:1000}}>
                <ListItemSecondaryAction>
                    <span hidden={hover}>
                        {
                            upload.progress === 1 && !error && (
                                <IconButton className={classes.successIcon} edge="end">
                                    <CheckCircleIcon />
                                </IconButton>
                            )
                        }
                        {   error && (
                                <IconButton 
                                    className={classes.errorIcon} 
                                    edge="end"
                                >
                                    <ErrorIcon />
                                </IconButton>
                            )
                        }
                    </span>
                    <span hidden={!hover}>
                        <IconButton
                            color={'primary'}
                            edge="end"
                            onClick={() => dispatch(Creators.removeUpload({id: upload.video.id}))}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </ListItemSecondaryAction>
            </Fade>)
        : null
    )
}

export default UploadAction;
