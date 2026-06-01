import { apiRequest } from './client';
import { ApiUser, TokenResponse } from './types';

export function loginRequest(email: string, password: string) {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signupRequest(fullName: string, email: string, password: string) {
  return apiRequest<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });
}

export function getMeRequest(token: string) {
  return apiRequest<ApiUser>('/auth/me', {
    method: 'GET',
    token,
  });
}