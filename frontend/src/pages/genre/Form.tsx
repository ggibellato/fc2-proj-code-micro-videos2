import { useState, useEffect } from 'react';
import { Box, Button, ButtonProps, Checkbox, FormControl, FormLabel, makeStyles, Select, TextField, Theme } from '@material-ui/core'
import { useForm } from "react-hook-form";
import genreHttp from '../../util/http/genre-http';
import { httpVideo } from '../../util/http';

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

    const { register, handleSubmit, getValues } = useForm({
        defaultValues: {
            is_active: true
        }
    });

    const [categoriesSelect, setCategoriesSelect] = useState([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        httpVideo.get('/categories').then(
            response => setCategoriesSelect(response.data.data)
        )
    }, []);

    function onSubmit(formData: any, event: any) {
        var sentData = {...formData};
        sentData["categories_id"] = categories;
        genreHttp
            .create(sentData)
            .then((response) => console.log(response));
    }

    const handleChangeMultiple = (event: React.ChangeEvent<{ value: unknown }>) => {
        const { options } = event.target as HTMLSelectElement;
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
          if (options[i].selected) {
            console.log(options[i].value);
            value.push(options[i].value);
          }
        }
        console.log(value);
        setCategories(value);
    };    

    var categoriesOptions = null;
    if(categoriesSelect.length > 0) {
        categoriesOptions = categoriesSelect.map((category) => (
            <option key={category["id"]} value={category["id"]}>
                {category["name"]}
            </option>
        ));
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
            <Box>
                <FormControl>
                    <FormLabel component="legend" className={classes.formLabel}>Categorias</FormLabel>
                    <Select
                        multiple
                        native
                        value={categories}
                        onChange={handleChangeMultiple}
                        inputProps={{
                            id: 'select-multiple-native',
                        }}
                    >
                        {categoriesOptions}
                    </Select>
                </FormControl>            
            </Box>
            <Checkbox
                name="is_active"
                inputRef={register}
                defaultChecked
            />
            Ativo?
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues, null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>                
        </form>
    )
}
