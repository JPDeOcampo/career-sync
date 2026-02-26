const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/career-sync`;

const USER_API_ENDPOINT = `${BASE_URL}/v1/user`;

const apiPath = {
  USER_REGISTER: {
    method: "POST",
    endpoint: `${USER_API_ENDPOINT}/register`,
  },
  USER_LOGIN: {
    method: "POST",
    endpoint: `${USER_API_ENDPOINT}/login`,
  },
  USER_REFRESH_TOKEN: {
    method: "GET",
    endpoint: `${USER_API_ENDPOINT}/refresh-token`,
  },
};

export default apiPath;
