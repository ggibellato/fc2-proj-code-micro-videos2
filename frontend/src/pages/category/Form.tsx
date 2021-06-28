import { Box, Button, ButtonProps, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';
import categoryHttp from '../../util/http/category-http';
import * as yup from "../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../util/yup';
import { useSnackbar} from 'notistack';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

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
    const classes = useStyles();

    const resolver = useYupValidationResolver(validationSchema);

    const { register, handleSubmit, getValues, setValue, errors, reset, watch } = useForm<FormData>({
        resolver,
        defaultValues: {
            is_active: true,
            name: ''
        }
    });

    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [category, setCategory] = useState<{id:string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading,
    };

    useEffect(() => {
        if(!id) {
            return;
        }
        async function getCategory() {
            setLoading(true);
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            } catch(error) {
                console.log(error);
                snackbar.enqueueSnackbar(
                    'Nao foi possível carregar as informações',
                    {variant: 'error'}
                );
            } finally {
                setLoading(false);
            }
        }
        getCategory();
    }, []);

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
            console.log(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar a categoria', {
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>                
        </form>
    )
}
