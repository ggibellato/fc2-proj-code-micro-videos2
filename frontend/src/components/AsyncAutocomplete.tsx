import {CircularProgress, TextField} from "@material-ui/core";
import {TextFieldProps} from "@material-ui/core/TextField";
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import { useSnackbar} from 'notistack';
import React, {useState, useEffect} from 'react'

interface AsyncAutocompleteProps {
    fetchOptions: (searchText: string) => Promise<any>
    TextFieldProps? : TextFieldProps
    AutocompleteProps?: Omit<Omit<AutocompleteProps<any, boolean, boolean, boolean>, 'renderInput'>, 'options'>
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {

    const {AutocompleteProps} = props;
    const {freeSolo, onOpen, onClose, onInputChange} = AutocompleteProps as any;
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    }

    const snackbar = useSnackbar();

    const autocompleteProps: AutocompleteProps<any, boolean, boolean, boolean> = {
        open,
        loading: loading,
        loadingText: "Carregando...",
        noOptionsText: "Nenhum item encontrado",
        ...(AutocompleteProps && {...AutocompleteProps}),
        onOpen(){
            setOpen(true);
            onOpen && onOpen();
        },
        onClose(){
            setOpen(false);
            onClose && onClose();
        },
        onInputChange(event, value){
            setSearchText(value);
            onInputChange && onInputChange();
        },
        options:options,
        getOptionLabel:(option) => option.name,
        renderInput: (params:any) => (
            <TextField 
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={"inherit"} size={20} />}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />    
        )
    };

    useEffect(() => {
        if(!open || searchText === "" && freeSolo){
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const data = await props.fetchOptions(searchText);
                if(isSubscribed) {
                    setOptions(data);
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
    }, [freeSolo ? searchText : open]);

    return (
        <Autocomplete {...autocompleteProps}/>
    );
}

export default AsyncAutocomplete;


