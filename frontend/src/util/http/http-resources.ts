import { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import axios from "axios";
import {serialize } from "object-to-formdata";

export default class HttpResource {

    private cancelList: CancelTokenSource | null = null;

    constructor(protected http: AxiosInstance, protected resource: string) {

    }

    list<T = any>(options?: {queryParams?:any}): Promise<AxiosResponse<T>> {
        if(this.cancelList) {
            this.cancelList.cancel('list request cancelled');
        }
        this.cancelList = axios.CancelToken.source();

        const config: AxiosRequestConfig = {
            cancelToken: this.cancelList.token
        };
        if(options && options.queryParams) {
            config.params = options.queryParams;
        }
        return this.http.get<T>(this.resource, config);
    }

    get<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.get<T>(`${this.resource}/${id}`);
    }

    create<T = any>(data: any): Promise<AxiosResponse<T>> {
        let sendData = this.makeSendData(data);
        return this.http.post<T>(this.resource, sendData);
    }   
    
    update<T = any>(id: any, data: any, options?: {http?:{ usePost: boolean}, config?: AxiosRequestConfig}): Promise<AxiosResponse<T>> {
        let sendData = data;
        if(this.containsFile(data)){
            sendData = this.getFormData(data);
        }
        const {http, config} = (options || {}) as any;
        return !options || !http || !http.usePost
        ? this.http.put<T>(`${this.resource}/${id}`, sendData, config)
        : this.http.post<T>(`${this.resource}/${id}`, sendData, config);
    }

    partialUpdate<T = any>(id: any, data: any, options?: {http?:{ usePost: boolean}, config?: AxiosRequestConfig}): Promise<AxiosResponse<T>> {
        let sendData = data;
        if(this.containsFile(data)){
            sendData = this.getFormData(data);
        }
        const {http, config} = (options || {}) as any;
        return !options || !http || !http.usePost
        ? this.http.patch<T>(`${this.resource}/${id}`, sendData, config)
        : this.http.post<T>(`${this.resource}/${id}`, sendData, config);
    }

    delete<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(`${this.resource}/${id}`);
    }

    deleteCollection<T = any>(queryParams:any): Promise<AxiosResponse<T>> {
        const config:AxiosRequestConfig = {};
        if(queryParams) {
            config['params'] = queryParams;
        }
        return this.http.delete<T>(`${this.resource}`, config);
    }

    isCancelledRequest(error: any) {
        return axios.isCancel(error);
    }

    private makeSendData(data: any) {
        return this.containsFile(data) ? this.getFormData(data) : data;
    }

    private getFormData(data: any) {
        // const formData = new FormData();
        // Object
        //     .keys(data)
        //     .forEach(key => {
        //         let value = data[key];
        //         if (typeof value === "undefined") {
        //             return;
        //         }
        //         if (typeof value === "boolean") {
        //             value = value ? 1 : 0;
        //         }
        //         if(value instanceof Array){
        //             value.forEach(v => formData.append(`${key}[]`, v))
        //             return;
        //         }
        //         formData.append(key, value)
        //     });
        return serialize(data, {booleansAsIntegers: true});
    }

    private containsFile(data:any) {
        return Object
            .values(data)
            .filter(el => el instanceof File).length !== 0
    }
}