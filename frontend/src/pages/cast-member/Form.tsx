import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, TextField } from '@material-ui/core'
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useHistory } from 'react-router';
import castMemberHttp from '../../util/http/castmember-http';
import * as yup from "../../util/vendor/yup/yup";
import { useYupValidationResolver } from '../../util/yup';
import { useSnackbar} from 'notistack';
import { CastMember } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import { DefaultForm } from '../../components/DefaultForm';

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
    const resolver = useYupValidationResolver(validationSchema);
    
    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger } = useForm<FormData>({
        resolver,
        defaultValues: {
            name: ''
        }
    });

    const snackbar = useSnackbar()
    const history = useHistory();
    const {id} = useParams<any>();
    const [castMember, setCastMember] = useState<CastMember | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if(!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.get(id);
                if(isSubscribed) {
                    setCastMember(data);
                    reset(data);
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

            return () => {
                isSubscribed = false;
            };
        })();
    }, [id, snackbar, reset]);

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
            console.error(error);
            snackbar.enqueueSnackbar('Nao foi possível salvar o membro de elenco', {
                variant: 'error'
            });
        }
        finally {
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
            <SubmitActions 
                disabledButtons={loading}
                handleSave={() => trigger().then((isValid) => {isValid && onSubmit(getValues(), null)})} 
            />
        </DefaultForm>
    )
}
