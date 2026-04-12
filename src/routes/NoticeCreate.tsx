import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MDEditor from '@uiw/react-md-editor';

function NoticeCreate() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<"NOTICE" | "MAINTENANCE" | "UPDATE">("NOTICE");
    const [content, setContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);

        console.log({ title, category, content, is_pinned: isPinned ? 1 : 0 });
        try {
            const res = await axios.post(
                "/api/admin/announcements",
                {
                    title: title.trim(),
                    category,
                    content: content.trim(),
                    is_pinned: isPinned ? 1 : 0
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                alert("공지가 등록되었습니다.");
                navigate("/notice");
                return;
            }

            alert("공지 등록에 실패했습니다.");
        } catch (error) {
            console.error("공지 등록 오류", error);
            alert("공지 등록 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="notice-page">
            <h2 style={{ cursor: "pointer", display: "inline-block" }} onClick={() => navigate("/notice")}>
                공지사항
            </h2>

            <div className="container notice-container">
                <form className="notice-form-card" onSubmit={handleSubmit}>
                    <div className="notice-form-grid">
                        <div className="notice-form-row">
                            <label htmlFor="notice-category">카테고리</label>
                            <select
                                id="notice-category"
                                className="notice-form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as "NOTICE" | "MAINTENANCE" | "UPDATE")}
                            >
                                <option value="NOTICE">안내</option>
                                <option value="MAINTENANCE">점검</option>
                                <option value="UPDATE">업데이트</option>
                            </select>
                        </div>

                        <label className="notice-form-check">
                            <input
                                type="checkbox"
                                checked={isPinned}
                                onChange={(e) => setIsPinned(e.target.checked)}
                            />
                            상단 고정
                        </label>
                    </div>

                    <div className="notice-form-row">
                        <label htmlFor="notice-title">제목</label>
                        <input
                            id="notice-title"
                            className="notice-form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="공지 제목을 입력해 주세요"
                        />
                    </div>

                    
                    <div className="notice-form-row">
                        <label htmlFor="notice-content">내용</label>
                        <div className="markarea">
                            <div data-color-mode="light">
                                <MDEditor preview="edit" height={865} value={content} onChange={(value) => setContent(value || "")} />
                            </div>
                        </div>
                    </div>

                    <div className="notice-form-actions">
                        <button type="button" className="notice-detail-btn notice-detail-btn-close" onClick={() => navigate("/notice")}>
                            취소
                        </button>
                        <button type="submit" className="notice-detail-btn notice-detail-btn-edit" disabled={isSubmitting}>
                            {isSubmitting ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NoticeCreate;
