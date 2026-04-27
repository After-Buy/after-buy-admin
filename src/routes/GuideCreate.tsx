import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MDEditor from '@uiw/react-md-editor';

function GuideCreate() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await axios.post(
                // 추후에 주소 수정
                "/api/admin/guides",
                {
                    title: title.trim(),
                    content: content.trim(),
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                alert("이용 안내가 등록되었습니다.");
                navigate("/guide");
                return;
            }

            alert("이용 안내 등록에 실패했습니다.");
        } catch (error) {
            console.error("이용 안내 등록 오류", error);
            alert("이용 안내 등록 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 style={{ cursor: "pointer", display: "inline-block" }} onClick={() => navigate("/guide")}>
                이용 안내 작성
            </h2>

            <div className="container detail-container">
                <form className="detail-form-card" onSubmit={handleSubmit}>
                    <div className="detail-form-row">
                        <label htmlFor="detail-title">제목</label>
                        <input
                            id="guide-title"
                            className="detail-form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="이용 안내 제목을 입력해 주세요"
                        />
                    </div>

                    
                    <div className="detail-form-row">
                        <label htmlFor="detail-content">내용</label>
                        <div className="markarea">
                            <div data-color-mode="light">
                                <MDEditor height={865} value={content} onChange={(value) => setContent(value || "")} />
                            </div>
                        </div>
                    </div>

                    <div className="detail-form-actions">
                        <button type="button" className="detail-btn detail-btn-close" onClick={() => navigate("/guide")}>
                            취소
                        </button>
                        <button type="submit" className="detail-btn detail-btn-edit" disabled={isSubmitting}>
                            {isSubmitting ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GuideCreate;
