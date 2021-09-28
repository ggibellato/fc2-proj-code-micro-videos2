import {CircularProgress, TextField} from "@material-ui/core";
import {TextFieldProps} from "@material-ui/core/TextField";
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import React, {useState, useEffect, useImperativeHandle, RefAttributes} from 'react'
import { useDebounce } from 'use-debounce';

interface AsyncAutocompleteProps extends RefAttributes<AsyncAutocompleteComponent> {
    fetchOptions: (searchText: string) => Promise<any>;
    debounceTime?: number;
    TextFieldProps? : TextFieldProps;
    AutocompleteProps?: Omit<Omit<AutocompleteProps<any, boolean, boolean, boolean>, 'renderInput'>, 'options'>;
}

export interface AsyncAutocompleteComponent {
    clear: () => void
}

const AsyncAutocomplete = React.forwardRef<AsyncAutocompleteComponent, AsyncAutocompleteProps>((props, ref) => {

    const {AutocompleteProps, debounceTime = 300, fetchOptions} = props;
    const {freeSolo = false, onOpen, onClose, onInputChange} = AutocompleteProps as any;
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebounce(searchText, debounceTime);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    }

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

    useEffect(()=> {
        if(!open && !freeSolo) {
            setOptions([]);
        }
    }, [freeSolo, open])

    useEffect(() => {
        if(!open || (debouncedSearchText === "" && freeSolo)){
            return;
        }

        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchOptions(debouncedSearchText);
                if(isSubscribed) {
                    setOptions(data);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        };
    }, [freeSolo, debouncedSearchText, open, fetchOptions]);

    useImperativeHandle(ref, () => ({
        clear: () => {
            setSearchText("");
            setOptions([]);
        }
    }));

    return (
        <Autocomplete {...autocompleteProps}/>
    );
});

export default AsyncAutocomplete;


