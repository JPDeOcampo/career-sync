import apiPath from "@/utils/apiPath";
import axiosInstance from "@/lib/axiosInstance";

export const userRegister = async ({
  firstName,
  lastName,
  email,
  password,
  reEnterPassword,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  reEnterPassword: string;
}) => {
  try {
    const { endpoint, method } = apiPath.USER_REGISTER;

    const response = await axiosInstance.request({
      url: `${endpoint}`,
      method,
      data: {
        firstName,
        lastName,
        email,
        password,
        reEnterPassword,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export default userRegister;
