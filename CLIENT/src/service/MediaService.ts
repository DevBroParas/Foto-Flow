import API from "../service/API";

export const getAllMedia = async () => await API.get("/media");

// export const uploadMedia = async () => await API.post("/media/upload", {
