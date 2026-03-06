import apiPath from "@/utils/apiPath";
import axiosInstance from "@/lib/axiosInstance";

export const userLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const { endpoint, method } = apiPath.USER_LOGIN;

    const response = await axiosInstance.request({
      url: endpoint,
      method,
      withCredentials: true,
      data: {
        email,
        password,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export default userLogin;
