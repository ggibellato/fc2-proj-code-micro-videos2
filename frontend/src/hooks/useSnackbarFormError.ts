import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { DeepMap } from "react-hook-form";

const useSnackbarFormError = (submitCount: number, errors:any) => {
    const snackbar = useSnackbar();
    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;
        if(submitCount> 0 && hasError) {
            snackbar.enqueueSnackbar(
                'Formulario invalido. Reveja os campos marcados de vermelhos.',
                {variant: 'error'}
            );
        }
    }, [submitCount]);
}


export default useSnackbarFormError;