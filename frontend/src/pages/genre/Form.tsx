import { useState, useEffect } from 'react';
import { Box, Button, ButtonProps, Checkbox, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core'
import { useForm } from "react-hook-form";
import genreHttp from '../../util/http/genre-http';
import categoryHttp from '../../util/http/category-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        },
        formLabel: {
            margin: theme.spacing(2)
        }

    }
})

export default function Form() {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "outlined",
    };

    const [categories, setCategories] = useState<any[]>([]);
    const { register, handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: {categories_id: [], is_active: true}
    });

    useEffect(() => {
        register({name: "categories_id"})
    }, [register]);

    useEffect(() => {
        categoryHttp
            .list()
            .then(response => setCategories(response.data.data))
    }, []);

    function onSubmit(formData: any, event: any) {
        console.log(formData);
        genreHttp
            .create(formData)
            .then((response) => console.log(response));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                inputRef={register}
                label="Nome"
                fullWidth
                variant={"outlined"}
            />
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={"normal"}
                fullWidth
                variant={"outlined"}
                onChange={(e) => {
                    setValue("categories_id", e.target.value);
                }}
                SelectProps={{
                    multiple: true
                }}
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
            <Checkbox
                name="is_active"
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>                
        </form>
    )
}
