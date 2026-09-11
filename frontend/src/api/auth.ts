import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  username: string;
}

export function login(username: string, password: string) {
  return apiClient
    .post<LoginResponse>('/auth/login', { username, password })
    .then((res) => res.data);
}

export function fetchMe() {
  return apiClient.get<{ username: string }>('/auth/me').then((res) => res.data);
}
