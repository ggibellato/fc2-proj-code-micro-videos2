import { useSnackbar } from "notistack";
import { useEffect } from "react";

const useSnackbarFormError = (submitCount: number, errors:any) => {
    const {enqueueSnackbar} = useSnackbar();
    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;
        if(submitCount> 0 && hasError) {
            enqueueSnackbar(
                'Formulario invalido. Reveja os campos marcados de vermelhos.',
                {variant: 'error'}
            );
        }
    }, [submitCount, errors, enqueueSnackbar]);
}


export default useSnackbarFormError;