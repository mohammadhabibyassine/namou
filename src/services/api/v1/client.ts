import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_CONFIG } from "@/constants/api";
import { handleAuthError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

let refreshOperation: Promise<void> | null = null;

const performRefresh = () =>
  axios
    .post(
      "/api/auth/refresh",
      {},
      {
        withCredentials: true,
        timeout: API_CONFIG.timeout,
      },
    )
    .then(() => undefined);

export const refreshBrowserSession = (): Promise<void> => {
  if (!refreshOperation) {
    const operation: Promise<void> =
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks
            .request("namou.auth-refresh", performRefresh)
            .then(() => undefined)
        : performRefresh();
    const currentOperation = operation.finally(() => {
      refreshOperation = null;
    });
    refreshOperation = currentOperation;
    return currentOperation;
  }

  return refreshOperation;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG,
  paramsSerializer: {
    indexes: null, // serializes arrays like attributeValueIds as attributeValueIds=1&attributeValueIds=2
  },
});

apiClient.interceptors.request.use(
  (config) => {
    logger.debug(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      {
        params: config.params,
      },
    );

    return config;
  },
  (error: AxiosError) => {
    logger.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const request = error.config as RetriableRequestConfig | undefined;
    if (error.response?.status === 401 && request && !request._authRetry) {
      request._authRetry = true;

      try {
        await refreshBrowserSession();
      } catch (refreshError) {
        logger.error(`[API Authentication Error] ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          refreshError,
        });
        await handleAuthError(error);
        return Promise.reject(refreshError);
      }

      return apiClient(request);
    }

    logger.error(`[API Error] ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      await handleAuthError(error);
    }

    return Promise.reject(error);
  },
);
