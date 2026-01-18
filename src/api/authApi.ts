import { financialApi } from "./financialApi";

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user_id: number;
};

export async function registerApi(payload: RegisterRequest) {
  const { data } = await financialApi.post<RegisterResponse>("/auth/register", payload);
  return data;
}

export async function loginApi(payload: LoginRequest) {
  const { data } = await financialApi.post<LoginResponse>("/auth/login", payload);
  return data;
}
