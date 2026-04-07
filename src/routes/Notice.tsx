import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import { useAuth } from "../contexts/AuthContext";

export type Announcement = {
    announcement_id: number;
    title: string;
    category: "NOTICE" | "MAINTENANCE" | "UPDATE";
    is_pinned: number;
    is_new: boolean;
    is_read: boolean;
    created_at: string;
};

const categories = ["ALL", "NOTICE", "MAINTENANCE", "UPDATE"] as const;
const categoryLabels: Record<typeof categories[number], string> = {
    ALL: "전체",
    NOTICE: "안내",
    MAINTENANCE: "점검",
    UPDATE: "업데이트"
};

function Notice() {
    const navigate = useNavigate();
    const { adminAccount } = useAuth();
    const [category, setCategory] = useState<typeof categories[number]>("ALL");
    const [keyword, setKeyword] = useState("");

    const [pinnedAnnouncements, setPinnedAnnouncements] = useState<Announcement[]>([
            
        {
            announcement_id: 2,
            title: "제품 등록 시 주의사항 안내",
            category: "NOTICE",
            is_pinned: 1,
            is_new: false,
            is_read: true,
            created_at: "2026-03-26"
        },
    ]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
        announcement_id: 1,
        title: "새로운 기능 업데이트",
        category: "UPDATE",
        is_pinned: 0,
        is_new: true,
        is_read: false,
        created_at: "2026-03-25"
    },
    {
        announcement_id: 3,
        title: "서버 점검 완료",
        category: "MAINTENANCE",
        is_pinned: 0,
        is_new: false,
        is_read: false,
        created_at: "2026-03-24"
    }
    ]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });

    const [isLoading, setIsLoading] = useState(false);

    const fetchAnnouncements = () => {
        setIsLoading(true);
        axios.get('/api/admin/announcements', {
            params: {
                category,
                page: pagination.current_page,
                size: 10,
                keyword: keyword.trim() || undefined
            },
            withCredentials: true
        })
            .then(res => {
                if (res.data.success) {
                    setPinnedAnnouncements(res.data.data.pinned_announcements || []);
                    setAnnouncements(res.data.data.announcements || []);
                    setPagination(res.data.data.pagination);
                }
            })
            .catch(err => console.error("공지사항 로드 오류:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [category, pagination.current_page]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setPagination(prev => ({ ...prev, current_page: 1 }));
            fetchAnnouncements();
        }
    }

    return (
        <div className="notice-page">
            <h2>공지사항</h2>

            <div className="container notice-container">
                <div className="notice-toolbar">
                    <div className="notice-toolbar-left">
                        <select value={category} onChange={(e) => {
                            setCategory(e.target.value as typeof categories[number]);
                            setPagination(prev => ({ ...prev, current_page: 1 }));
                        }}>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === 'ALL' ? '전체' : cat === 'NOTICE' ? '안내' : cat === 'MAINTENANCE' ? '점검' : '업데이트'}
                                </option>
                            ))}
                        </select>
                        <input
                            className="search-box"
                            value={keyword}
                            placeholder="검색어 입력"
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <button className="notice-new-btn">새 공지 작성</button>
                </div>

                <div className="card notice-card">
                    {isLoading && <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>로딩 중...</div>}
                    {!isLoading && (
                        <table className="notice-table">
                            <thead>
                                <tr className="notice-table">
                                    <th>No</th>
                                    <th style={{ width: '60%' }}>제목</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pinnedAnnouncements.length === 0 && announcements.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="notice-empty">공지사항이 없습니다.</td>
                                    </tr>
                                )}

                                {pinnedAnnouncements.map((item) => (
                                    <tr key={item.announcement_id} className="notice-row" onClick={() => navigate(`/notice/${item.announcement_id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #e3e7ee' }}>
                                        <td style={{ textAlign: 'center' }}><Pin size={16} color="#43ABE5" style={{ display: 'inline' }} /></td>
                                        <td className="notice-title" style={{ fontWeight: 'bold', color: '#1f2937' }}>
                                            {item.title}
                                            {item.is_new && <span className="notice-badge">N</span>}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{adminAccount}</td>
                                        <td style={{ textAlign: 'center', color: '#6b7280' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}

                                {announcements.map((item) => (
                                    <tr key={item.announcement_id} className="notice-row" onClick={() => navigate(`/notice/${item.announcement_id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #e3e7ee' }}>
                                        <td style={{ textAlign: 'center' }}>{item.announcement_id}</td>
                                        <td className="notice-title" style={{ color: '#374151' }}>
                                            {item.title}
                                            {item.is_new && <span className="notice-badge">N</span>}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{categoryLabels[item.category]}</td>
                                        <td style={{ textAlign: 'center', color: '#6b7280' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {pagination.total_pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', marginBottom: '20px' }}>
                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => {
                                        setPagination(prev => ({ ...prev, current_page: pageNum }));
                                        window.scrollTo(0, 0);
                                    }}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        border: pageNum === pagination.current_page ? 'none' : '1px solid #e5e7eb',
                                        backgroundColor: pageNum === pagination.current_page ? '#43ABE5' : 'white',
                                        color: pageNum === pagination.current_page ? 'white' : '#374151',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: pageNum === pagination.current_page ? 'bold' : 'normal'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Notice;
