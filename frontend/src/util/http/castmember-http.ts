import { httpVideo } from ".";
import HttpResource from "./http-resources";

const castMemberHttp = new HttpResource(httpVideo, "cast_members");

export default castMemberHttp;