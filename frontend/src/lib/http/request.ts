import type { AxiosRequestConfig } from "axios";
import { http } from "./client";

type ApiRequestOptions = AxiosRequestConfig & {
  body?: unknown;
};

function toRequestData(body: unknown): unknown {
  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, data, method = "GET", ...config } = options;

  const response = await http.request<T>({
    ...config,
    url: path,
    method,
    data: data ?? toRequestData(body),
  });

  return response.data;
}
