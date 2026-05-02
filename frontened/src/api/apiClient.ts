import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://task-manager-x57a.onrender.com/api",
    withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});