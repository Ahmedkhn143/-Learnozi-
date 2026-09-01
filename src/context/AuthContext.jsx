import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — verify stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-mock-jwt-token-12345') {
      setUser({
        id: 'demo_user_123',
        name: 'Demo Student',
        email: 'demo@learnozi.com',
        isOnboarded: true,
        academicProfile: { educationLevel: 'University', university: 'NUST' }
      });
      setLoading(false);
      return;
    }

    axios
      .get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Fallback user if server token is valid locally
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch (e) { localStorage.removeItem('token'); }
        } else {
          localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Check your credentials.';
      throw new Error(errorMsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const { token, user: userData } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
      }
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Try again.';
      throw new Error(errorMsg);
    }
  };

  const demoLogin = () => {
    const demoData = {
      id: 'demo_user_123',
      name: 'Demo Student',
      email: 'demo@learnozi.com',
      isOnboarded: true,
      academicProfile: { educationLevel: 'University', university: 'NUST' }
    };
    localStorage.setItem('token', 'demo-mock-jwt-token-12345');
    localStorage.setItem('user_data', JSON.stringify(demoData));
    setUser(demoData);
    return demoData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
