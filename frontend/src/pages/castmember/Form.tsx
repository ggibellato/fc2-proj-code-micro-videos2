import { Box, Button, ButtonProps, FormControlLabel, FormLabel, makeStyles, Radio, RadioGroup, TextField, Theme } from '@material-ui/core'
import { Controller, useForm } from "react-hook-form";
import castmemberHttp from '../../util/http/castmember-http';

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

    const { register, handleSubmit, getValues, control } = useForm({
        defaultValues: {
            type: "1"
        }
    });

    function onSubmit(formData: any, event: any) {
        castmemberHttp
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
            <FormLabel component="legend" className={classes.formLabel}>Type</FormLabel>
            <Controller
                control={control}
                name="type"
                as={
                    <RadioGroup>
                        <FormControlLabel value="1" control={<Radio />} label="Diretor" />
                        <FormControlLabel value="2" control={<Radio />} label="Ator" />
                    </RadioGroup>            
                }
            />
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues, null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>                
        </form>
    )
}
