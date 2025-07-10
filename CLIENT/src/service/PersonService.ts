import API from "./API";

export const getAllPerson = async () => await API.get("/person");

// update person name 
export const updatePerson = async (id: string, data: {name:string}) => await API.patch(`/person/${id}`, data);
