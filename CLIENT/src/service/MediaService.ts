import API from "../service/API";

export const getAllMedia = async () => await API.get("/media");
export const moveToBin = async (id: string) =>
  await API.patch(`/media/${id}/bin`);
export const moveManyToBinApi = async (ids: string[]) =>
  await API.patch("/media/move-to-bin", { ids });

export const uploadMedia = async (formData: FormData) =>
  await API.post("/media/upload", formData);

export const downloadMultipleMediaApi = async (ids: string[]) => {
  const response = await API.post(
    "/media/download-multiple",
    { ids },
    {
      responseType: "blob", // Important to receive a file blob
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "media-download.zip"); // File name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
