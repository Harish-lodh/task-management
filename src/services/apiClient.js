import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5005/api", // your backend URL
});

// Add token if required
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
