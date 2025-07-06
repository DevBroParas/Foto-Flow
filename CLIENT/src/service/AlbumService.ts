import API from "./API";

export const getAllAlbum = async () => await API.get("/album");

export const createAlbumApi = async (data: any) =>
  await API.post("/album", data);

export const updateAlbumApi = async (id: string, data: any) =>
  await API.put(`/album/${id}`, data);

export const deleteAlbumApi = async (id: string) =>
  await API.delete(`/album/${id}`);
