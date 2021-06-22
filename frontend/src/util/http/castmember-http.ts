import { httpVideo } from ".";
import HttpResource from "./http-resources";

const categoryHttp = new HttpResource(httpVideo, "cast_members");

export default categoryHttp;