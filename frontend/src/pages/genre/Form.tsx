import { Checkbox, FormControlLabel, MenuItem, TextField } from '@material-ui/core'
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';
import * as yup from "../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../util/yup';
import { useSnackbar} from 'notistack';
import { Category, Genre } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import { DefaultForm } from '../../components/DefaultForm';

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
    categories_id: yup.array()
        .label('Categorias')
        .required()
        .min(1),
});

export default function Form() {
    const resolver = useYupValidationResolver(validationSchema);

    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger } = useForm<{name:any, categories_id:any, is_active:any}>({
        resolver,
        defaultValues: {
            categories_id: [],
            is_active: true
        }
    });
    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [genre, setGenre] = useState<Genre | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            const promises = [categoryHttp.list({queryParams: {all: ''}})];            
            if(id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                if(isSubscribed) {
                    setCategories(categoriesResponse.data.data);
                    if(id) {
                        setGenre(genreResponse.data);
                        reset({
                            ...genreResponse.data,
                            categories_id: genreResponse.data.categories.map((category:any) => category.id)
                        });
                    }
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
        register({name: "categories_id"});
        register({name: "is_active"});
    }, [register]);

    async function onSubmit(formData: any, event: any) {
        setLoading(true);
        try {
            const http = !genre
                ? genreHttp.create(formData)
                : genreHttp.update(genre.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Gênero salvo com sucesso', {
                variant: 'success'
            });
            setTimeout( () => {
                event 
                ? (
                    genre 
                        ? history.replace(`/genres/${data.data.id}/edit`)
                        : history.push(`/genres/${data.data.id}/edit`)                        

                )
                : history.push('/genres');
            })
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar o gênero', {
                variant: 'error'
            });
        } finally {
            setLoading(false)            
        }
    }

    return (
        <DefaultForm GridItemProps={{xs: 12, md: 6}}  onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                InputLabelProps={{shrink:true}}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
            />
            <TextField
                select
                name="categories_id"
                label="Categorias"
                fullWidth
                margin={"normal"}
                variant={"outlined"}
                value={watch('categories_id')}
                onChange={(e) => {
                    setValue("categories_id", e.target.value);
                }}
                disabled={loading}
                InputLabelProps={{shrink:true}}
                SelectProps={{
                    multiple: true
                }}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (<MenuItem key={key} value={category.id}>{category.name}</MenuItem>)
                    )
                }
            </TextField>
            <FormControlLabel
                label={'Ativo?'}
                labelPlacement={'end'}
                disabled={loading}
                control={
                    <Checkbox
                        name="is_active"
                        color={"primary"}
                        onChange={() => setValue('is_active', !getValues()['is_active'])}
                        checked={watch('is_active')}
                    />
                }
            />
            <SubmitActions 
                disabledButtons={loading}
                handleSave={() => trigger().then((isValid) => {isValid && onSubmit(getValues(), null)})} 
            />
        </DefaultForm>
    )
}
