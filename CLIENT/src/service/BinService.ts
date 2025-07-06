import API from "./API";

export const getAllBin = async () => await API.get("/bin/all");
export const deleteManyPermanentlyApi = async (ids: string[]) =>
  await API.delete("/bin/delete-many", { data: { ids } });
export const restoreMediaApi = async (ids: string[]) =>
  await API.patch(`/bin/restore-many`,  { ids });
