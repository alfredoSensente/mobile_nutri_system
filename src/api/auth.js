import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-nutri-system.onrender.com/api';

const API = axios.create({ baseURL: BASE_URL });

// Adjunta el access token a cada request
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira, intenta refrescarlo automáticamente
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = await AsyncStorage.getItem('refresh_token');

      if (!refresh) {
        await AsyncStorage.clear();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
        const newAccessToken = response.data.access;
        await AsyncStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch {
        await AsyncStorage.clear();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const login = (credentials) => API.post('/auth/login/', credentials);
export const getMe = () => API.get('/users/me/');

export default API;
