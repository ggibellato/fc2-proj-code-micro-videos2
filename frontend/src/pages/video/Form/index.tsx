import { Card, CardContent, Checkbox, FormControlLabel, Grid, makeStyles, 
    TextField, Theme, Typography, 
    useMediaQuery, useTheme } from '@material-ui/core'
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';

import RatingField from './RatingField';
import UploadField from './UploadField';
import genreHttp from '../../../util/http/genre-http';
import categoryHttp from '../../../util/http/category-http';
import videoHttp from '../../../util/http/video-http';
import * as yup from "../../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../../util/yup';
import { useSnackbar} from 'notistack';
import { Video, Category, Genre, ListResponse, VideoFileFieldsMap } from '../../../util/models';
import SubmitActions from '../../../components/SubmitActions';
import { DefaultForm } from '../../../components/DefaultForm';
import AsyncAutocomplete from '../../../components/AsyncAutocomplete';

const useStyles = makeStyles( (theme: Theme) => ({
    cardUpload: {
        bordRadius: "4px",
        backgroundColor:"#f5f5f5",
        margin: theme.spacing(2, 0)
    }
}));


const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Titulo')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lancamento')
        .required()
        .min(1),
    duration: yup.number()
        .label('Duracao')
        .required()
        .min(1),
    rating: yup.string()
        .label('Classificacao')
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);

export default function Form() {
    const classes = useStyles();
    const resolver = useYupValidationResolver(validationSchema);

    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger } = 
        useForm<{
            title: string, 
            description: string, 
            year_launched:number, 
            duration: number,
            opened: boolean,
            rating: string,
            thumb_file: string,
            banner_file: string,
            trailer_file: string,            
            video_file: string,            
        }>({
            resolver,
            defaultValues: {
                opened: false
        }
    });
    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        if(!id) { 
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await videoHttp.get(id);
                if(isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                }
            } catch (error) {
                snackbar.enqueueSnackbar(
                    'Nao foi possível carregar as informações',
                    {variant: 'error'}
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        };
    }, [id, snackbar, reset]);

    useEffect(() => {
        ['rating', 'opened', ...fileFields].forEach(field => register({name: field as never}));
    }, [register]);

    async function onSubmit(formData: any, event: any) {
        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(formData)
                : videoHttp.update(video.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Video salvo com sucesso', {
                variant: 'success'
            });
            setTimeout( () => {
                event 
                ? (
                    id 
                        ? history.replace(`/videos/${data.data.id}/edit`)
                        : history.push(`/videos/${data.data.id}/edit`)                        

                )
                : history.push('/videos');
            })
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar o video', {
                variant: 'error'
            });
        } finally {
            setLoading(false)            
        }
    }
    
    const fetchOptions = (searchText: string) => genreHttp.list<ListResponse<Genre>>({
        queryParams: {
            search: searchText, 
            all: ""
        }
    }).then(({data}) => {
        return data.data;
    })

    return (
        <DefaultForm GridItemProps={{xs: 12}}  onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Titulo"
                        fullWidth
                        variant={"outlined"}
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink:true}}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        name="description"
                        label="Sinopse"
                        multiline
                        rows="4"
                        margin="normal"
                        fullWidth
                        variant={"outlined"}
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{shrink:true}}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name="year_launched"
                                label="Ano de lancamento"
                                type="number"
                                margin="normal"
                                fullWidth
                                variant={"outlined"}
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink:true}}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="duration"
                                label="Duracao"
                                type="number"
                                margin="normal"
                                fullWidth
                                variant={"outlined"}
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{shrink:true}}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br/>
                    <AsyncAutocomplete 
                        fetchOptions={fetchOptions}
                        AutocompleteProps={{
                            freeSolo: true,
                            getOptionLabel: option => option.name
                        }}
                        TextFieldProps={{
                            label: "Generos"
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField 
                        value={watch('rating')}
                        setValue={(value: string) => setValue('rating', value, { shouldValidate: true})}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <br/>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField 
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value: string) => setValue('thumb_file', value)}
                            />
                            <UploadField 
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value: string) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField 
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value: string) => setValue('trailer_file', value)}
                            />
                            <UploadField 
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value: string) => setValue('video_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <br/>
                    <FormControlLabel
                        control = {
                            <Checkbox
                                name='opened'
                                color={'primary'}
                                onChange={
                                    () => setValue('opened', !getValues()['opened'])
                                }
                                checked={watch('opened')}
                                disabled={loading}
                            />    
                        }
                        label = {
                            <Typography color="primary" variant={"subtitle2"}>
                                Quero que este conteudo apareca na secao lancamentos
                            </Typography>
                        }
                        labelPlacement="end"
                    />
                </Grid>
            </Grid>
            <SubmitActions 
                disabledButtons={loading}
                handleSave={() => trigger().then((isValid) => {isValid && onSubmit(getValues(), null)})} 
            />
        </DefaultForm>
    )
}
