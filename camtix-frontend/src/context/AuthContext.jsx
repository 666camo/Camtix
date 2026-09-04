import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const role = localStorage.getItem('role');
      const fullName = localStorage.getItem('fullName');
      const email = localStorage.getItem('email');
      const idUser = localStorage.getItem('idUser');
      
      setUser({
        email,
        fullName,
        role,
        idUser: idUser ? parseInt(idUser, 10) : null
      });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('idUser');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const loginUser = (userData) => {
    localStorage.setItem('token', userData.token);
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
    localStorage.setItem('role', userData.role);
    localStorage.setItem('fullName', userData.fullName);
    localStorage.setItem('email', userData.email);
    if (userData.idUser) {
      localStorage.setItem('idUser', userData.idUser);
    }
    
    setToken(userData.token);
    setUser({
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      idUser: userData.idUser ? parseInt(userData.idUser, 10) : null
    });
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('idUser');
    
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
