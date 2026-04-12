import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { announcement_details as mockAnnouncementDetails } from "../mocks/announcements";

export type AnnouncementDetail = {
    announcement_id: number;
    title: string;
    category: "NOTICE" | "MAINTENANCE" | "UPDATE";
    content: string;
    is_pinned: number;
    is_new: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
};


function NoticeDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [detail, setDetail] = useState<AnnouncementDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    const categories = ["ALL", "NOTICE", "MAINTENANCE", "UPDATE"] as const;
    const categoryLabels: Record<typeof categories[number], string> = {
        ALL: "전체",
        NOTICE: "안내",
        MAINTENANCE: "점검",
        UPDATE: "업데이트"
    };
    useEffect(() => {
        if (!id) return;
        setIsLoading(true);

        const fallback = () => {
            const found = mockAnnouncementDetails.find(item => item.announcement_id === Number(id));
            if (found) {
                setDetail(found);
                setErrorMsg('');
            } else {
                setDetail(null);
                setErrorMsg("데이터를 불러올 수 없습니다.");
            }
        };

        axios.get(`/api/admin/announcements/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setDetail(res.data.data);
                    setErrorMsg('');
                } else {
                    fallback();
                }
            })
            .catch(err => {
                console.error("공지사항 상세 로드 오류", err);
                fallback();
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                const res = await axios.delete(`/api/admin/announcements/${id}`, { withCredentials: true });
                if (res.data.success) {
                    alert('삭제되었습니다.');
                    navigate('/notice');
                }
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (errorMsg || !detail) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg || "데이터가 없습니다."}</div>;

    return (
        <div className="notice-page">
            <h2 style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => navigate('/notice')}>공지사항</h2>

            <div className="container notice-container">
                <div className="notice-detail-card">
                    <div className="notice-detail-header">
                        <h3>
                            <span style={{ color: '#888', marginRight: '8px', fontSize: '18px' }}>[{categoryLabels[detail.category]}]</span>
                            {detail.title}
                        </h3>
                        <div className="notice-detail-meta">
                            <span>작성일: {new Date(detail.created_at).toLocaleString()}</span>
                            <span>수정일: {new Date(detail.updated_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="notice-detail-body" style={{ whiteSpace: 'pre-line', marginTop: '30px', padding: '30px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        {detail.content}
                    </div>

                    <div className="notice-detail-actions">
                        <button className="notice-detail-btn notice-detail-btn-close" onClick={() => navigate(-1)}>
                            닫기
                        </button>
                        <button className="notice-detail-btn notice-detail-btn-delete" onClick={handleDelete}>
                            삭제
                        </button>
                        <button className="notice-detail-btn notice-detail-btn-edit">
                            수정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoticeDetail;
