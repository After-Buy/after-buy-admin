import {LayoutDashboard, Megaphone, FileText, MessageSquare, ClipboardList, ScanLine, CircleUserRound, LogOut} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, adminAccount} = useAuth(); // 전역 로그아웃 함수

    const handleLogout = async () => {
        try { 
            // 서버에 세션 쿠키 삭제 요청
            await axios.post('/api/admin/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        } finally {
            // 통신 성공 여부와 상관없이 내 브라우저는 로그아웃 처리
            logout(); 
            navigate("/login", { replace: true });
        }
    }

    return (
        <>
            <div className="sidebar">
                <aside>
                    <nav>
                        <h3 onClick={()=>{navigate('/')}}>After-Buy</h3>
                        <CircleUserRound size={40} style={{alignSelf: "center"}}/>
                        {adminAccount && <p style={{textAlign: "center", fontWeight: "bold"}}>{adminAccount}</p>}
                        <ul>
                            <li className={`${location.pathname === "/" ? "active" : ""}`}>
                            <Link to="/"><LayoutDashboard size={18} />대시보드</Link></li>
                            <li className={`${location.pathname === "/notice" ? "active" : ""}`}>
                            <Link to="/notice"><Megaphone size={18} />공지사항</Link></li>
                            <li className={`${location.pathname === "/error" ? "active" : ""}`}>
                            <Link to="/error"><FileText size={18} />에러 로그</Link></li>
                            <li className={`${location.pathname === "/guide" ? "active" : ""}`}>
                            <Link to="/guide"><MessageSquare size={18} />이용 안내</Link></li>
                            <li className={`${location.pathname === "/log" ? "active" : ""}`}>
                            <Link to="/log"><ClipboardList size={18} />로그인 내역</Link></li>
                            <li className={`${location.pathname === "/ocr" ? "active" : ""}`}>
                            <Link to="/ocr"><ScanLine size={18} />OCR 오인식</Link></li>
                        </ul>
                        <ul className="logout">
                            <button onClick={handleLogout}><LogOut size={18} />로그아웃</button>
                        </ul>
                    </nav>
                </aside>
            </div>
            <div className="content">
                <main>
                    <Outlet />
                </main>
            </div>
        </>
    )
}
export default Layout