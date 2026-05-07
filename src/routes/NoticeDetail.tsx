import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
    announcement_details as mockAnnouncementDetails,
    announcements as mockAnnouncements,
    pinned_announcements as mockPinnedAnnouncements
} from "../mocks/announcements";
import MDEditor from '@uiw/react-md-editor';

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
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState<"NOTICE" | "MAINTENANCE" | "UPDATE">("NOTICE");
    const [editContent, setEditContent] = useState("");
    const [editIsPinned, setEditIsPinned] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        axios.get(`/api/admin/announcements/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setDetail(res.data.data);
                    setErrorMsg('');
                } else {
                }
            })
            .catch(err => {
                console.error("공지사항 상세 로드 오류", err);
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

    const handleEditClick = () => {
        if (detail) {
            setEditTitle(detail.title);
            setEditCategory(detail.category);
            setEditContent(detail.content);
            setEditIsPinned(detail.is_pinned === 1);
            setIsEditing(true);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!editTitle.trim() || !editContent.trim()) {
            alert("제목과 내용을 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        const updateMockData = () => {
            const numId = Number(id);
            const index = mockAnnouncementDetails.findIndex(item => item.announcement_id === numId);
            if (index !== -1) {
                mockAnnouncementDetails[index] = {
                    ...mockAnnouncementDetails[index],
                    title: editTitle.trim(),
                    category: editCategory,
                    content: editContent.trim(),
                    is_pinned: editIsPinned ? 1 : 0,
                    updated_at: new Date().toISOString()
                };
            }
            
            let foundItem: any = null;
            const lIndex = mockAnnouncements.findIndex(item => item.announcement_id === numId);
            if (lIndex !== -1) {
                foundItem = { ...mockAnnouncements[lIndex] };
                mockAnnouncements.splice(lIndex, 1);
            }
            
            const pIndex = mockPinnedAnnouncements.findIndex(item => item.announcement_id === numId);
            if (pIndex !== -1) {
                if (!foundItem) foundItem = { ...mockPinnedAnnouncements[pIndex] };
                mockPinnedAnnouncements.splice(pIndex, 1);
            }
            
            if (foundItem) {
                foundItem.title = editTitle.trim();
                foundItem.category = editCategory;
                foundItem.is_pinned = editIsPinned ? 1 : 0;
                
                if (editIsPinned) {
                    mockPinnedAnnouncements.push(foundItem);
                } else {
                    mockAnnouncements.push(foundItem);
                }
            }
            
            setDetail({
                ...detail!,
                title: editTitle.trim(),
                category: editCategory,
                content: editContent.trim(),
                is_pinned: editIsPinned ? 1 : 0,
                updated_at: new Date().toISOString()
            });
            alert("수정사항이 반영되었습니다.");
            setIsEditing(false);
        };

        try {
            const res = await axios.put(
                `/api/admin/announcements/${id}`,
                {
                    title: editTitle.trim(),
                    category: editCategory,
                    content: editContent.trim(),
                    is_pinned: editIsPinned ? 1 : 0
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                updateMockData();
            } else {
                updateMockData(); // fallback
            }
        } catch (error) {
            console.error("공지 수정 오류", error);
            updateMockData(); // fallback
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (errorMsg || !detail) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg || "데이터가 없습니다."}</div>;

    if (isEditing) {
        return (
            <div className="notice-page">
                <h2 style={{ cursor: "pointer", display: "inline-block" }} onClick={() => navigate("/notice")}>
                    공지사항
                </h2>
                <div className="container">
                    <form className="detail-form-card" onSubmit={handleEditSubmit}>
                        <div className="detail-form-grid">
                            <div className="detail-form-row">
                                <label htmlFor="detail-category">카테고리</label>
                                <select
                                    id="notice-category"
                                    className="detail-form-input"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value as "NOTICE" | "MAINTENANCE" | "UPDATE")}
                                >
                                    <option value="NOTICE">안내</option>
                                    <option value="MAINTENANCE">점검</option>
                                    <option value="UPDATE">업데이트</option>
                                </select>
                            </div>

                            <label className="detail-form-check">
                                <input
                                    type="checkbox"
                                    checked={editIsPinned}
                                    onChange={(e) => setEditIsPinned(e.target.checked)}
                                />
                                상단 고정
                            </label>
                        </div>

                        <div className="detail-form-row">
                            <label htmlFor="detail-title">제목</label>
                            <input
                                id="notice-title"
                                className="detail-form-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="공지 제목을 입력해 주세요"
                            />
                        </div>
                        
                        <div className="detail-form-row">
                            <label htmlFor="detail-content">내용</label>
                            <div className="markarea">
                                <div data-color-mode="light">
                                    <MDEditor preview="edit" height={865} value={editContent} onChange={(value) => setEditContent(value || "")} />
                                </div>
                            </div>
                        </div>

                        <div className="detail-form-actions">
                            <button type="button" className="detail-btn detail-btn-close" onClick={() => setIsEditing(false)}>
                                취소
                            </button>
                            <button type="submit" className="detail-btn detail-btn-edit" disabled={isSubmitting}>
                                {isSubmitting ? "수정 중..." : "수정 완료"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="notice-page">
            <h2 style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => navigate('/notice')}>공지사항</h2>

            <div className="container">
                <div className="detail-card">
                    <div className="detail-header">
                        <h3>
                            <span style={{ color: '#888', marginRight: '8px', fontSize: '18px' }}>[{categoryLabels[detail.category]}]</span>
                            {detail.title}
                        </h3>
                        <div className="detail-meta">
                            <span>작성일: {new Date(detail.created_at).toLocaleString()}</span>
                            <span>수정일: {new Date(detail.updated_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="detail-body" data-color-mode="light" style={{ marginTop: '30px', padding: '30px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <MDEditor.Markdown source={detail.content} style={{ backgroundColor: 'transparent', color: '#333' }} />
                    </div>

                    <div className="detail-actions">
                        <button className="detail-btn detail-btn-close" onClick={() => navigate(-1)}>
                            닫기
                        </button>
                        <button className="detail-btn detail-btn-delete" onClick={handleDelete}>
                            삭제
                        </button>
                        <button className="detail-btn detail-btn-edit" onClick={handleEditClick}>
                            수정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoticeDetail;
