import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    // 로그인 인증 로직 추가 예정
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;