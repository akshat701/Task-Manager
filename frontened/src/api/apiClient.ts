import axios from "axios";
//https://task-manager-x57a.onrender.com/api
export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
    withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});