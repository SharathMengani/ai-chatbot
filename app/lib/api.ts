import axios from "axios";
import { getSession } from "next-auth/react";

type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
};

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  async (config) => {
    const session = (await getSession()) as AuthSession | null;

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;