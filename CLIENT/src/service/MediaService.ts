import API from "../service/API";

export const getAllMedia = async () => await API.get("/media");
export const moveToBin = async (id: string) =>
  await API.patch(`/media/${id}/bin`);
export const moveManyToBinApi = async (ids: string[]) =>
  await API.patch("/media/move-to-bin", { ids });

export const uploadMedia = async (formData: FormData) => await API.post("/media/upload", formData);
