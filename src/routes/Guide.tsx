import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Guidetype = {
    faq_id: number;
    title: string;
    created_by: number;
    created_at: string;
    updated_at: string;
};

function Guide() {
    const [faqs, setFaqs] = useState<Guidetype[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate()
    const fetchFaqs = () => {
        setIsLoading(true);
        axios.get('/api/admin/faqs', {
            params: {
                page: pagination.current_page,
                size: 10,
                keyword: keyword.trim() || undefined
            },
            withCredentials: true
        })
        .then(res => {
            if (res.data.success) {
                setFaqs(res.data.data.faqs);
                setPagination(res.data.data.pagination);
            }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchFaqs();
    }, [pagination.current_page]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setPagination(prev => ({...prev, current_page: 1}));
            fetchFaqs();
        }
    }

    return (
        <div className="guide-page">
            <h2>이용 안내</h2>
            
            <div className="container guide-container">
                <div className="toolbar">
                    <input
                        className="search-box"
                        value={keyword}
                        placeholder="검색어 입력"
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button className="new-btn" onClick={()=>(navigate('/guide/new'))}>이용 안내 작성</button>
                </div>

                <div className="card guide-card">
                    {isLoading ? <div style={{padding: '50px', textAlign: 'center', color: '#777'}}>로딩 중...</div> : (
                        <table className="guide-table">
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th>ID</th>
                                    <th style={{ width: '60%' }}>제목</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{textAlign: 'center', padding: '30px', color: '#777'}}>이용 안내가 없습니다.</td>
                                    </tr>
                                )}
                                {faqs.map(faq => (
                                    <tr key={faq.faq_id} className="guide-row" onClick={() => navigate(`/guide/${faq.faq_id}`)}>
                                        <td style={{textAlign: 'center'}}>{faq.faq_id}</td>
                                        <td className="notice-title">{faq.title}</td>
                                        <td>{faq.created_by}</td>
                                        <td style={{ textAlign: 'center', color: '#6b7280' }}>{new Date(faq.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {pagination.total_pages > 1 && (
                        <div style={{display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px 0'}}>
                            {Array.from({length: pagination.total_pages}, (_, i) => i + 1).map(pageNum => (
                                <button 
                                    key={pageNum} 
                                    onClick={() => setPagination(prev => ({...prev, current_page: pageNum}))}
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
    )
}

export default Guide;