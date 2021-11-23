import { Card, CardContent, Checkbox, FormControlLabel, FormHelperText, Grid, makeStyles, 
    TextField, Theme, Typography, 
    useMediaQuery, useTheme } from '@material-ui/core'
import { zipObject } from 'lodash';    
import { useSnackbar } from 'notistack';    
import { useContext, useState, useEffect, MutableRefObject, useRef, useMemo, createRef } from 'react';
import { useForm } from "react-hook-form";
import {useSelector} from 'react-redux';
import { useParams, useHistory } from 'react-router';

import RatingField from './RatingField';
import UploadField from './UploadField';
import { InputFileComponent } from '../../../components/InputFile';
import videoHttp from '../../../util/http/video-http';
import * as yup from "../../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../../util/yup';
import { CastMember, Category, Genre, Video, VideoFileFieldsMap } from '../../../util/models';
import SubmitActions from '../../../components/SubmitActions';
import { DefaultForm } from '../../../components/DefaultForm';
import GenreField, {GenreFieldComponent} from './GenreField';
import CategoryField, {CategoryFieldComponent} from './CategoryField';
import CastMemberField, {CastMemberFieldComponent} from './CastMemberField';
import useSnackbarFormError from '../../../hooks/useSnackbarFormError';
import LoadingContext from '../../../components/loading/LoadingContext';
import SnackbarUpload from '../../../components/SnackbarUpload';
import { UploadModule, Upload, FileInfo} from '../../../store/upload/types';
import { Creators } from '../../../store/upload';
import {useDispatch} from "react-redux";
import {omit} from 'lodash';

const useStyles = makeStyles( (theme: Theme) => ({
    cardUpload: {
        boardRadius: "4px",
        backgroundColor:"#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        boardRadius: "4px",
        backgroundColor:"#f5f5f5",
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
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
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup.number()
        .label('Duração')
        .required()
        .min(1),
    cast_members: yup.array()
        .label('Membro do elenco')
        .required()
        .min(1),
    genres: yup.array()
        .label('Gêneros')
        .required()
        .min(1)
        .test({
            message: 'Cada gênero escolhido precisa ter pelo menos uma categoria selecionada',
            test(value) {
                var genres = value as Genre[];
                return genres.every(
                    g => g.categories.filter(
                        cat => this.parent.categories.map((c: Category) => c.id).includes(cat.id)
                    ).length !== 0
                );
            }
        }),
    categories: yup.array()
        .label('Categorias')
        .required()
        .min(1),
    rating: yup.string()
        .label('Classificação')
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);

export default function Form() {
    const classes = useStyles();
    const resolver = useYupValidationResolver(validationSchema);

    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger, formState } = 
        useForm<{
            title: string, 
            description: string, 
            year_launched:number, 
            duration: number,
            opened: boolean,
            rating: any,
            thumb_file: string,
            banner_file: string,
            trailer_file: string,            
            video_file: string,            
            cast_members: CastMember[],
            genres: Genre[],
            categories: Category[]
        }>({
            resolver,
            defaultValues: {
                rating: null,
                opened: false,
                cast_members: [],
                genres: [],
                categories: []
        }
    });
    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [video, setVideo] = useState<Video | null>(null);
    const loading = useContext(LoadingContext);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(()=> createRef()))
    ) as MutableRefObject<{[key:string]: MutableRefObject<InputFileComponent>}>;

    useSnackbarFormError(formState.submitCount, errors);
    
    const uploads = useSelector<UploadModule, Upload[]>((state) => state.upload.uploads);
    const dispatch = useDispatch();

    useEffect(() => {
        ['rating', 'opened', 'genres', 'categories', 'cast_members', ...fileFields].forEach(field => register({name: field as never}));
    }, [register]);

    useEffect(() => {
        if(!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
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
            }
        })();

        return () => {
            isSubscribed = false;
        };
    }, [id, snackbar, reset]);

    async function onSubmit(formData: any, event: any) {
        try {
            const sendData = omit(
                formData,
                [...fileFields, 'cast_members' as never, 'genres' as never, 'categories' as never]
            );
            sendData['cast_members_id' as never] = formData['cast_members'].map((cast_member:any) => cast_member.id);
            sendData['categories_id' as never] = formData['categories'].map((category:any) => category.id);
            sendData['genres_id' as never] = formData['genres'].map((genre:any) => genre.id);            

            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(video.id, sendData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Video salvo com sucesso', {
                variant: 'success'
            });
            uploadFiles(data.data);
            id && resetForm(video);
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
        }
    }
    
    function uploadFiles(video: Video) {
        const files: FileInfo[] = fileFields
            .filter(fileField => getValues()[fileField as never])
            .map(fileField => ({fileField, file: getValues()[fileField as never]}));
        
        if(files.length > 0) {
            dispatch(Creators.addUpload({video, files}));

            snackbar.enqueueSnackbar('', {
                key: 'snackbar-upload',
                persist: true,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                content: (key, message) => (<SnackbarUpload id={key} />),
            });
        }
    }

    function resetForm(data: any) {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);
    }

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
                                label="Ano de lançamento"
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
                                label="Duração"
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
                    <CastMemberField 
                        ref={castMemberRef}
                        cast_members={watch('cast_members')} 
                        setCastMembers={(value) => setValue('cast_members', value, {shouldValidate: true})}
                        error={errors.cast_members}
                        disabled={loading}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField 
                                ref={genreRef}
                                genres={watch('genres')} 
                                setGenres={(value) => setValue('genres', value, {shouldValidate: true})}
                                categories={watch('categories')} 
                                setCategories={(value) => setValue('categories', value, {shouldValidate: true})}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField 
                                ref={categoryRef}
                                categories={watch('categories')} 
                                setCategories={(value) => setValue('categories', value, {shouldValidate: true})}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
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
                                ref={uploadsRef.current['thumb_file']}
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value: string) => setValue('thumb_file', value)}
                            />
                            <UploadField 
                                ref={uploadsRef.current['banner_file']}
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
                                ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value: string) => setValue('trailer_file', value)}
                            />
                            <UploadField 
                                ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value: string) => setValue('video_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
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
                                    Quero que este conteúdo apareça na seção lançamentos
                                </Typography>
                            }
                            labelPlacement="end"
                        />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <SubmitActions 
                disabledButtons={loading}
                handleSave={() => trigger().then((isValid) => {isValid && onSubmit(getValues(), null)})} 
            />
        </DefaultForm>
    )
}
