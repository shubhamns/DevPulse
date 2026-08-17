import { persistAuthSession } from "@/lib/auth";
import { apiRequest } from "@/lib/http";
import type { AuthResponse, LoginInput, MeResponse, RegisterInput } from "@/features/auth/schemas";

function storeTokens(response: AuthResponse): AuthResponse {
  persistAuthSession({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
  return response;
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return storeTokens(
    await apiRequest<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      data: input,
    }),
  );
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  return storeTokens(
    await apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      data: input,
    }),
  );
}

export async function fetchMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/v1/auth/me");
}

export async function logoutUser(refreshToken?: string | null): Promise<void> {
  if (!refreshToken) {
    return;
  }

  await apiRequest("/api/v1/auth/logout", {
    method: "POST",
    data: { refreshToken },
  });
}
