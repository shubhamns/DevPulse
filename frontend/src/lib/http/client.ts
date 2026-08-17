import axios, { type AxiosInstance } from "axios";
import { registerAuthInterceptors } from "./interceptors";

const sharedConfig = {
  baseURL: import.meta.env.VITE_API_URL || undefined,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

export const http: AxiosInstance = axios.create(sharedConfig);
export const refreshHttp: AxiosInstance = axios.create(sharedConfig);

registerAuthInterceptors(http, refreshHttp);
