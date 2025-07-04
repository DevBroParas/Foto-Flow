import API from "../service/API";
import type { RegisterType, LoginType } from "../types/UserTypes";

export const registerUser = async (data: RegisterType) =>
  await API.post("/user/register", data);

export const loginUser = async (data: LoginType) =>
  await API.post("/user/login", data);

export const logoutUser = async () => await API.get("/user/logout");

export const getProfile = async () => await API.get("/user/profile");
