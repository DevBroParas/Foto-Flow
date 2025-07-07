import API from "./API";

export const getAllPerson = async () => await API.get("/person");
