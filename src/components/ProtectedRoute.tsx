import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    // API 통신 결과가 아직 안 나왔으면 (새로고침 직후 등) 빈 화면 혹은 로딩스피너
    if (isLoading) {
        return <div style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center'}}>인증 상태를 확인 중입니다...</div>;
    }

    // 결과에 따라 분기
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;