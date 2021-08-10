import { Checkbox, FormControlLabel, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';
import categoryHttp from '../../util/http/category-http';
import * as yup from "../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../util/yup';
import { useSnackbar} from 'notistack';
import { Category } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import { DefaultForm } from '../../components/DefaultForm';

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
});

type FormData = {
    name: string,
    description: string,
    is_active: boolean,
};

export default function Form() {
    const resolver = useYupValidationResolver(validationSchema);

    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger } = useForm<FormData>({
        resolver,
        defaultValues: {
            is_active: true,
            name: ''
        }
    });

    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if(!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await categoryHttp.get(id);
                if(isSubscribed) {
                    setCategory(data.data);
                    reset(data.data);
                }
            } catch(error) {
                console.error(error);
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

    useEffect(() =>{
        register({name: "is_active"});
    }, [register]);

    async function onSubmit(formData: any, event: any) {
        setLoading(true);
        try {
            const http = !category
                ? categoryHttp.create(formData)
                : categoryHttp.update(category.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Categoria salva com sucesso', {
                variant: 'success'
            });

            setTimeout( () => {
                event 
                ? (
                    category 
                        ? history.replace(`/categories/${data.data.id}/edit`)
                        : history.push(`/categories/${data.data.id}/edit`)                        

                )
                : history.push('/categories');
            })

        } catch(error) {
            console.error(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar a categoria', {
                variant: 'error'
            });
        } finally {
            setLoading(false);
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
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                margin={"normal"}
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                InputLabelProps={{shrink:true}}
            />
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
