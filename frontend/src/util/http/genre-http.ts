import { httpVideo } from ".";
import HttpResource from "./http-resources";

const genreHttp = new HttpResource(httpVideo, "genres");

export default genreHttp;