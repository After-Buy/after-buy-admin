import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminAccount?: string;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminAccount, setAdminAccount] = useState<string | undefined>();

  // 앱 로드 시 쿠키 유효성 검사 (check API 호출)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/admin/auth/check', {
          withCredentials: true,
        });

        if (response.data.success) {
          setIsAuthenticated(true);
          setAdminAccount(response.data.data?.admin_account);
        } else {
          setIsAuthenticated(false);
          setAdminAccount(undefined);
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setAdminAccount(undefined);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, adminAccount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
