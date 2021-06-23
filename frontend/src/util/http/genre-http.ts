import { httpVideo } from ".";
import HttpResource from "./http-resources";

const categoryHttp = new HttpResource(httpVideo, "genres");

export default categoryHttp;