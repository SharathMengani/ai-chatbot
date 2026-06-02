import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  console.log("API INTERCEPTOR - SESSION", session);
//   if (session?.accessToken) {
//     config.headers.Authorization = `Bearer ${session.accessToken}`;
//   }

  return config;
});

export default api;