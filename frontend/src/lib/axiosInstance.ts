import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const cookies = document.cookie.split(";").reduce(
//         (acc, cookie) => {
//           const [key, val] = cookie.trim().split("=");
//           acc[key] = decodeURIComponent(val);
//           return acc;
//         },
//         {} as Record<string, string>,
//       );

//       const sessionToken = cookies["session_token"];

//       if (sessionToken) {
//         config.headers["x-session-token"] = sessionToken;
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

export default axiosInstance;
