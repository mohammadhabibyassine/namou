import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setOnUnauthorized } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { apiClient } from "./client";

const originalAdapter = apiClient.defaults.adapter;

const unauthorizedError = (config: InternalAxiosRequestConfig) => {
  const response: AxiosResponse = {
    config,
    data: { message: "Authentication required", statusCode: 401 },
    headers: new AxiosHeaders(),
    status: 401,
    statusText: "Unauthorized",
  };

  return new AxiosError(
    "Request failed with status code 401",
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    response,
  );
};

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
  setOnUnauthorized(null);
  vi.restoreAllMocks();
});

describe("API authentication recovery", () => {
  it("silently refreshes and retries a recoverable 401", async () => {
    let attempts = 0;
    apiClient.defaults.adapter = vi.fn(async (config) => {
      attempts += 1;
      if (attempts === 1) throw unauthorizedError(config);

      return {
        config,
        data: { items: [] },
        headers: new AxiosHeaders(),
        status: 200,
        statusText: "OK",
      };
    });
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({ status: 204 });
    const logError = vi.spyOn(logger, "error").mockImplementation(() => {});

    await expect(apiClient.get("/wishlist")).resolves.toMatchObject({
      status: 200,
    });

    expect(attempts).toBe(2);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(logError).not.toHaveBeenCalled();
  });

  it("clears the session when the retried request is still unauthorized", async () => {
    apiClient.defaults.adapter = vi.fn(async (config) => {
      throw unauthorizedError(config);
    });
    vi.spyOn(axios, "post").mockResolvedValue({ status: 204 });
    vi.spyOn(logger, "error").mockImplementation(() => {});
    const onUnauthorized = vi.fn();
    setOnUnauthorized(onUnauthorized);

    await expect(apiClient.get("/wishlist")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
