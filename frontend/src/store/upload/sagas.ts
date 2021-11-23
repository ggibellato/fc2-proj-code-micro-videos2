import { AxiosError } from "axios";
import {Types, Creators} from './index';
import {EventChannel, eventChannel, END} from 'redux-saga';
import {actionChannel, ActionPattern, take, call, CallEffect, put} from 'redux-saga/effects';
import {AddUploadAction, FileInfo} from './types';
import {Video} from '../../util/models';
import videoHttp from '../../util/http/video-http';

export function* uploadWatcherSaga() {
    const newFilesChannel : ActionPattern = yield actionChannel(Types.ADD_UPLOAD);
    while (true) {
        const {payload}: AddUploadAction = yield take(newFilesChannel);
        for(const fileInfo of payload.files) {
            try{
                const response: CallEffect = yield call(uploadFile, {video: payload.video, fileInfo});
                console.log(response);
            }
            catch(e) {
                console.log(e);
            }
        }
        console.log(payload);
    }
}

//criando um novo video
// 1 - POST e criar
// 2 - PUT com upload

//editar um novo video
// 1 - PUT e dditar
// 2 - PUT com upload
function* uploadFile({video, fileInfo}: {video: Video, fileInfo: FileInfo}) {
    // fazer upload
    // capturar progresso
    // atualizar progresso
    // tratamento de erro
    const channel:EventChannel<any> = yield call(sendUpload, {id: video.id, fileInfo});
    while(true) {
        try{
            const {progress, response} = yield take(channel);
            if(response) {
                return response;
            }
            yield put(Creators.updateProgress({
                video,
                fileField: fileInfo.fileField,
                progress
            }));
        }
        catch(e) {
            yield put(Creators.setUploadError({
                video,
                fileField: fileInfo.fileField,
                error: e as AxiosError
            }));
            throw e;
        }
    }
}

function sendUpload({id, fileInfo}: {id: string, fileInfo: FileInfo}) {
    // termino do upload
    // erro do upload
    // progress (multiplo)
    return eventChannel(emitter => {
        videoHttp.partialUpdate(id, {
                _method: 'PATCH',
                [fileInfo.fileField]: fileInfo.file
            }, {
                http: {
                    usePost: true
                },
                config: {
                    headers: {
                        'x-ignore-loading': true
                    },
                    onUploadProgress(progressEvent: ProgressEvent) {
                        if(progressEvent.lengthComputable) {
                            const progress = progressEvent.loaded/ progressEvent.total;
                            emitter({progress});
                        }
                        
                    }
                }
            }
        )
        .then(response => emitter({response}))
        .catch(error => emitter(error))
        .finally(() => emitter(END));
        
        const unsubscribe = () => {};
        return unsubscribe;
    });
}    