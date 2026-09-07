/** Browser requests stay same-origin and are allowlisted by the Next.js BFF. */
export const API_BASE_URL = "/api/backend";

export const API_TIMEOUT = 15000;
export const API_UPLOAD_TIMEOUT = 60000;

export const API_CONFIG = {
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
