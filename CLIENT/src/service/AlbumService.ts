import API from "./API";

export const getAllAlbum = async () => await API.get("/album");
