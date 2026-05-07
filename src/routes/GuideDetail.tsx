import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import MDEditor from '@uiw/react-md-editor';

type GuideDetail = {
    faq_id: number;
    title: string;
    content: string;
    created_by: number;
    created_at: string;
    updated_at: string;
};

function GuideDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [detail, setDetail] = useState<GuideDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        axios.get(`/api/admin/faqs/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setDetail(res.data.data);
                } else {
                    setErrorMsg("데이터를 불러올 수 없습니다.");
                }
            })
            .catch(err => {
                console.error("이용안내 상세 로드 오류", err);
                setErrorMsg("이용안내를 찾을 수 없습니다.");
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                const res = await axios.delete(`/api/admin/faqs/${id}`, { withCredentials: true });
                if (res.data.success) {
                    alert('삭제되었습니다.');
                    navigate('/guide');
                }
            } catch (e) {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleEditClick = () => {
        if (detail) {
            setEditTitle(detail.title);
            setEditContent(detail.content);
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
        axios.put(`/api/admin/faqs/${id}`,
            {
                title: editTitle.trim(),
                content: editContent.trim()
            },
            { withCredentials: true }
        ).then(res => {
            if (res.data.success) {
                setDetail(prev => prev ? {
                    ...prev,
                    title: editTitle.trim(),
                    content: editContent.trim(),
                } : prev);
                alert("이용 안내가 수정되었습니다.");
                setIsEditing(false);
                navigate('/guide/' + id);
            } else {
                alert("이용 안내 수정에 실패했습니다.");
            }
            setIsSubmitting(false);
        });
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (errorMsg || !detail) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg || "데이터가 없습니다."}</div>;

    if (isEditing) {
        return (
            <div>
                <h2 style={{ cursor: "pointer", display: "inline-block" }} onClick={() => navigate("/guide")}>
                    이용 안내
                </h2>
                <div className="container">
                    <form className="detail-form-card" onSubmit={handleEditSubmit}>

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
        <div className="guide-page">
            <h2 style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => navigate('/guide')}>이용 안내</h2>

            <div className="container">
                <div className="detail-card">
                    <div className="detail-header">
                        <h3>
                            {detail.title}
                        </h3>
                        <div className="detail-meta">
                            <span>작성일: {new Date(detail.created_at).toLocaleString()}</span>
                            <span>수정일: {new Date(detail.updated_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="detail-body" style={{ whiteSpace: 'pre-line', marginTop: '30px', padding: '30px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
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

export default GuideDetail;
