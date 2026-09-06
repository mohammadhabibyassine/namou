import { AxiosError, isAxiosError } from "axios";

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiError {
  message?: string;
  errors?: ValidationErrors;
  code?: string;
  statusCode?: number;
  success?: boolean;
}

export const toAxiosError = (error: unknown): AxiosError<ApiError> | null => {
  return isAxiosError<ApiError>(error) ? error : null;
};

export const extractErrorMessage = (error: unknown): string => {
  if (!error) return "An unexpected error occurred";

  const axiosError = toAxiosError(error);

  if (axiosError?.response?.data) {
    const { message, errors } = axiosError.response.data;

    if (message) {
      return Array.isArray(message) ? message.join(", ") : message;
    }

    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }

  if (axiosError?.message) {
    if (axiosError.message.includes("Network Error")) {
      return "Network error. Please check your connection.";
    }
    if (axiosError.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return axiosError.message;
  }

  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  return "An unexpected error occurred";
};

export const extractValidationErrors = (error: unknown): ValidationErrors => {
  const axiosError = toAxiosError(error);

  if (axiosError?.response?.data?.errors) {
    return axiosError.response.data.errors;
  }

  return {};
};

export const isNetworkError = (error: unknown): boolean => {
  const axiosError = toAxiosError(error);
  if (!axiosError) {
    return false;
  }
  return (
    axiosError.message?.includes("Network Error") ||
    axiosError.code === "ECONNABORTED" ||
    !axiosError.response
  );
};

export const isRequestCanceled = (error: unknown): boolean => {
  const axiosError = toAxiosError(error);
  return axiosError?.code === "ERR_CANCELED";
};

export const getErrorCode = (error: unknown): string | null => {
  const axiosError = toAxiosError(error);
  return axiosError?.response?.data?.code || null;
};

export const getHttpStatus = (error: unknown): number | null => {
  const axiosError = toAxiosError(error);
  return axiosError?.response?.status ?? null;
};

export const isNotFoundError = (error: unknown): boolean => {
  return getHttpStatus(error) === 404;
};

let onUnauthorizedHandler: (() => void | Promise<void>) | null = null;

export const setOnUnauthorized = (
  handler: (() => void | Promise<void>) | null,
) => {
  onUnauthorizedHandler = handler;
};

export const handleAuthError = async (
  error: unknown,
  onUnauthorized?: () => void | Promise<void>,
): Promise<boolean> => {
  const status = getHttpStatus(error);

  if (status === 401) {
    if (onUnauthorized) {
      await onUnauthorized();
    } else if (onUnauthorizedHandler) {
      await onUnauthorizedHandler();
    }
    return true;
  }

  return false;
};
