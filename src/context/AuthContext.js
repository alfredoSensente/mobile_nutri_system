import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, getMe } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar la app, verifica si ya hay sesión guardada
  useEffect(() => {
    const loadSession = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        try {
          const response = await getMe();
          setUser(response.data);
        } catch {
          await AsyncStorage.clear();
        }
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const login = async (username, password) => {
    const response = await loginApi({ username: username.trim(), password: password.trim() });
    const { access, refresh } = response.data;
    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);
    const me = await getMe();
    setUser(me.data);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
