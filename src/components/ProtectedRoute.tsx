import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const verifySession = async () => {
            // localStorage에 플래그 없으면 즉시 거부 (불필요한 API 호출 방지)
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                setIsAuthenticated(false);
                return;
            }

            try {
                // 인증 쿠키를 요구하는 기존 API 하나를 호출하여 확인
                await axios.get('/api/admin/login-logs', { 
                    params: { page: 1, size: 1 },
                    withCredentials: true 
                });
                
                // 에러 없으면 인증된 상태로 간주
                setIsAuthenticated(true);
            } catch (error) {
                // 401 에러 시 인증 실패로 간주
                setIsAuthenticated(false);
                localStorage.removeItem('isLoggedIn');
            }
        };

        verifySession();
    }, []);

    // 백엔드에서 응답이 올 때까지 대기 화면 노출
    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>인증 정보를 확인 중입니다...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;