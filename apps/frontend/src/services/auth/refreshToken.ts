import apiPath from "@/utils/apiPath";
import axiosInstance from "@/lib/axiosInstance";

export const userRefreshToken = async () => {
  try {
    const { endpoint, method } = apiPath.USER_REFRESH_TOKEN;

    const response = await axiosInstance.request({
      url: endpoint,
      method,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export default userRefreshToken;
