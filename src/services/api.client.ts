import axios from 'axios';
import { storage } from '@utils/storage';
import { STORAGE_KEYS } from '@constants/index';

const BASE_URL =
  (process.env['EXPO_PUBLIC_API_BASE_URL'] as string | undefined) ??
  'https://api.medinacollective.org/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach auth token on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      // Import router lazily to avoid circular dependency
      const { router } = await import('expo-router');
      router.replace('/(auth)/sign-in');
    }
    return Promise.reject(error);
  },
);
