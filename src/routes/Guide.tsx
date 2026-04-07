import { useEffect, useState } from "react";
import axios from "axios";

type FAQ = {
    faq_id: number;
    title: string;
    created_by: number;
    created_at: string;
    updated_at: string;
};

function Guide() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            <h2>이용 안내 (FAQ)</h2>
            
            <div className="container" style={{marginTop: '30px'}}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <input
                        className="search-box"
                        style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', width: '300px'}}
                        value={keyword}
                        placeholder="검색어 입력 후 Enter"
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button style={{marginLeft: '10px', padding: '8px 16px', backgroundColor: '#43ABE5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>새 FAQ 작성</button>
                </div>

                <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                    {isLoading ? <div style={{padding: '50px', textAlign: 'center', color: '#777'}}>로딩 중...</div> : (
                        <table style={{width: '100%', margin: '0', borderCollapse: 'collapse'}}>
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th style={{padding: '16px', textAlign: 'center', width: '80px', color: '#556978', fontWeight: 'bold'}}>ID</th>
                                    <th style={{padding: '16px', textAlign: 'left', color: '#556978', fontWeight: 'bold'}}>제목</th>
                                    <th style={{padding: '16px', textAlign: 'center', width: '150px', color: '#556978', fontWeight: 'bold'}}>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{textAlign: 'center', padding: '30px', color: '#777'}}>FAQ가 없습니다.</td>
                                    </tr>
                                )}
                                {faqs.map(faq => (
                                    <tr key={faq.faq_id} style={{borderBottom: '1px solid #eee', cursor: 'pointer'}} onClick={() => alert('FAQ 상세 구현 준비 (ID: ' + faq.faq_id + ')')}>
                                        <td style={{padding: '16px', textAlign: 'center'}}>{faq.faq_id}</td>
                                        <td style={{padding: '16px', color: '#374151', fontWeight: '500'}}>{faq.title}</td>
                                        <td style={{padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px'}}>{new Date(faq.created_at).toLocaleDateString()}</td>
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