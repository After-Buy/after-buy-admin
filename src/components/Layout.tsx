import {LayoutDashboard, Megaphone, FileText, MessageSquare, ClipboardList, ScanLine, CircleUserRound, LogOut} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

function Layout() {
    
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // 로그아웃 처리 로직 추가 예정
        localStorage.removeItem('isLoggedIn'); 
        navigate("/login", { replace: true });
    }

    return (
        <>
            <div className="sidebar">
                <aside>
                    <nav>
                        <h3>After-Buy</h3>
                        <CircleUserRound size={40} style={{alignSelf: "center"}}/>
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