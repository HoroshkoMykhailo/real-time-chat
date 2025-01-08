const { VITE_API_PATH, VITE_APP_PROXY_SERVER_URL } = import.meta.env;

const ENV = {
  API_PATH: VITE_API_PATH as string,
  SERVER_URL: VITE_APP_PROXY_SERVER_URL as string
};

export { ENV };
