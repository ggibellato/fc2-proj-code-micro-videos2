import { useEffect, useMemo, useState } from 'react';
import { addGlobalRequestInterceptor, addGlobalResponseInterceptor, removeGlobalRequestInterceptor, removeGlobalResponseInterceptor } from '../../util/http';

import LoadingContext from './LoadingContext';

export const LoadingProvider = (props:any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countRequest, setCountRequest] = useState<number>(0);

    useMemo(() => {
        let isSubscribed = true;
        //axios.interceptors.request.use();
        const requestIds = addGlobalRequestInterceptor((config) => {
            if(isSubscribed) {
                setLoading(true);
                setCountRequest((prevCountRequest) => prevCountRequest + 1);
            }
            return config;
        });
        //axios.interceptors.response.use();
        const responseIds = addGlobalResponseInterceptor(
            (response) => {
                if(isSubscribed) {
                    decrementCountRequest();
                }
                return response;
            }, (error) => {
                if(isSubscribed) {
                    decrementCountRequest();
                }
                return Promise.reject(error);
            }
        );
        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, [true]);

    useEffect(() => {
        if(!countRequest) {
            setLoading(false);
        }
    }, [countRequest] );

    function decrementCountRequest() {
        setCountRequest((prevCountRequest) => prevCountRequest - 1);
    }


    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};