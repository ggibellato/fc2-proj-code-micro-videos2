import { httpVideo } from ".";
import HttpResource from "./http-resources";
import { AxiosResponse } from "axios";
import { Video } from '../models';

class VideoHttp extends HttpResource {
    addFile(id: any, data: any): Promise<AxiosResponse<Video>> {
        return this.http.post<Video>(`videos/${id}`, data);
    }
}

const videoHttp = new VideoHttp(httpVideo, "videos");

export default videoHttp;