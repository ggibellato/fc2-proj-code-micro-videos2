import { 
    Card, 
    CardContent, 
    Divider,
    ExpansionPanel, 
    ExpansionPanelDetails, 
    ExpansionPanelSummary, 
    Grid, 
    List, 
    makeStyles, 
    Theme, 
    Typography 
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import React from 'react';
import { Page } from '../../components/Page';
import UploadItem from './UploadItem';
import {useSelector} from 'react-redux';
import {Upload, UploadModule} from '../../store/upload/types';
import {VideoFileFieldsMap} from '../../util/models';


const useStyles = makeStyles( (theme: Theme) => {
    return ({
        panelSummary: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
        },
        expandedIcon: {
            color: theme.palette.primary.contrastText
        }
    });
});


const Uploads = () => {
    const classes = useStyles();

    const uploads = useSelector<UploadModule, Upload[]>((state: UploadModule) => {
        return state.upload.uploads
    });

    return (
        <Page title={'Uploads'}>
            { 
                uploads.map((upload, key) => (
                    <Card elevation={5} key={key}>
                        <CardContent>
                            <UploadItem uploadOrFile={upload}>
                                {upload.video.title}
                            </UploadItem>
                        </CardContent>
                        <ExpansionPanel style={{margin:0}}>
                            <ExpansionPanelSummary
                                className={classes.panelSummary}
                                expandIcon={<ExpandMoreIcon className={classes.expandedIcon} />}
                            >
                                <Typography>Ver detalhes</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails style={{padding: '0px'}}>
                                <Grid item xs={12}>
                                    <List dense={true} style={{padding: 'opx'}}>
                                        { 
                                            upload.files.map((file, key) =>(
                                                <React.Fragment key={key}>
                                                    <Divider />
                                                    <UploadItem uploadOrFile={file}>
                                                        {`${VideoFileFieldsMap[file.fileField as never]} - ${file.filename}`} 
                                                    </UploadItem>
                                                </React.Fragment>
                                            ))
                                        }
                                    </List>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Card>
                ))
            }   
        </Page>
    );
}

export default Uploads;