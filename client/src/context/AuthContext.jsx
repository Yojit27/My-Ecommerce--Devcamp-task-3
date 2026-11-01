import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem('shop_user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const saveUser = (data) => {
    localStorage.setItem('shop_user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    saveUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    saveUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('shop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
