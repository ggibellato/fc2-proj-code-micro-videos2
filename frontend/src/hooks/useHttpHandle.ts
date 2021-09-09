import { useSnackbar } from "notistack";
import axios from 'axios';

const useHttpHandle = () => {
    const snackbar = useSnackbar();
    return async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        } catch(e) {
            console.log(e);
            if(!axios.isCancel(e)) {
                snackbar.enqueueSnackbar(
                    'Nao foi possível carregar as infirmações',
                    { variant: 'error'}
                );
            }
            throw e;
        }

    }
};

export default useHttpHandle;