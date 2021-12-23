import { useSnackbar } from "notistack";
import { useCallback } from 'react'
import axios from 'axios';

const useHttpHandle = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback(async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        } catch(e) {
            console.log(e);
            if(!axios.isCancel(e)) {
                enqueueSnackbar(
                    'Nao foi possível carregar as infirmações',
                    { variant: 'error'}
                );
            }
            throw e;
        }

    }, [enqueueSnackbar]);
};

export default useHttpHandle;