import { apiClient } from "@/lib/api-client";
import type { LoginFormValues } from "../schema";
import type { LoginResponse } from "../types";

export async function login(credentials: LoginFormValues) {
  const { data } = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}
