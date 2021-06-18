import { httpVideo } from ".";
import HttpResource from "./http-resources";

const categoryHttp = new HttpResource(httpVideo, "categories");

export default categoryHttp;