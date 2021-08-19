import { httpVideo } from ".";
import HttpResource from "./http-resources";

const videoHttp = new HttpResource(httpVideo, "videos");

export default videoHttp;