import {LayoutDashboard, Megaphone, FileText, MessageSquare, ClipboardList, ScanLine} from "lucide-react";
import { Link, Outlet, useLocation } from 'react-router-dom';

function Layout() {
    
    let location = useLocation();

    return (
        <div className="sidebar">
            <aside>
                <nav>
                    <h3>After-buy</h3>
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
                </nav>
            </aside>
            <div className="content">
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
export default Layout