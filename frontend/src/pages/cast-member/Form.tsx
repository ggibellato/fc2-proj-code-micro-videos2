import { Box, Button, ButtonProps, FormControl, FormControlLabel, FormHelperText, FormLabel, makeStyles, Radio, RadioGroup, TextField, Theme } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';
import castMemberHttp from '../../util/http/castmember-http';
import * as yup from "../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../util/yup';
import { useSnackbar} from 'notistack';

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

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
    type: yup.number()
        .label('Tipo')
        .required(),
});

type FormData = {
    name: string,
    type: bigint,
};

export default function Form() {
    const classes = useStyles();

    const resolver = useYupValidationResolver(validationSchema);
    
    const { register, handleSubmit, getValues, setValue, errors, reset, watch } = useForm<FormData>({
        resolver,
        defaultValues: {
            name: ''
        }
    });

    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [castMember, setCastMember] = useState<{id:string} | null>(null);
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
        async function getCastmember(){
            setLoading(true);
            try {
                const {data} = await castMemberHttp.get(id);
                setCastMember(data.data);
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

        getCastmember();
    }, []);

    useEffect( () => {
        register({name: "type"})
    }, [register]);
    
    async function onSubmit(formData: any, event: any) {
        setLoading(true);
        try {
            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Membro de elenco salvo com sucesso', {
                variant: 'success'
            });
            setTimeout( () => {
                event 
                ? (
                    castMember 
                        ? history.replace(`/cast-members/${data.data.id}/edit`)
                        : history.push(`/cast-members/${data.data.id}/edit`)                        

                )
                : history.push('/cast-members');
            })
        } catch (error) {
            console.log(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar o membro de elenco', {
                variant: 'error'
            });
        }
        finally {
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
            <FormControl 
                margin={"normal"}
                disabled={loading}
                error={errors.type !== undefined}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue("type", parseInt(e.target.value));
                    }}
                    value={watch('type') + ""}
                >
                    <FormControlLabel value="1" control={<Radio />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio />} label="Ator" />
                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>
                }         
            </FormControl>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>                
        </form>
    )
}
