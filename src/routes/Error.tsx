import { useEffect, useState } from "react";
import axios from "axios";

type ErrorLog = {
    log_id: number;
    error_type: string;
    error_message: string;
    full_message: string;
    is_resolved: number;
    resolved_at: string | null;
    created_at: string;
};

function ErrorLogs() {
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [isLoading, setIsLoading] = useState(false);

    const [unresolvedCount, setUnresolvedCount] = useState(0);

    const fetchLogs = () => {
        setIsLoading(true);
        axios.get('/api/admin/error-logs', {
            params: {
                error_type: typeFilter,
                page: pagination.current_page,
                size: 10
            },
            withCredentials: true
        })
        .then(res => {
            if (res.data.success) {
                setErrorLogs(res.data.data.error_logs);
                setPagination(res.data.data.pagination);
                setUnresolvedCount(res.data.data.unresolved_count);
            }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchLogs();
    }, [pagination.current_page, typeFilter]);

    const handleResolveToggle = async (logId: number) => {
        try {
            await axios.patch(`/api/admin/error-logs/${logId}/resolve`, {}, { withCredentials: true });
            fetchLogs(); // refresh
        } catch (e) {
            console.error("해결상태 변경 오류", e);
        }
    }

    return (
        <div className="error-page">
            <h2>에러 로그</h2>
            
            <div className="container" style={{marginTop: '30px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{fontSize: '16px', fontWeight: 'bold'}}>
                        미해결 예외: <span style={{color: '#ef4444'}}>{unresolvedCount}</span>건
                    </div>
                    <select 
                        style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc'}}
                        value={typeFilter} 
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPagination(prev => ({...prev, current_page: 1}));
                        }}
                    >
                        <option value="ALL">전체 유형</option>
                        <option value="ERROR">ERROR</option>
                        <option value="WARNING">WARNING</option>
                    </select>
                </div>

                <div className="card" style={{padding: '0', overflow: 'hidden'}}>
                    {isLoading ? <div style={{padding: '50px', textAlign: 'center', color: '#777'}}>로딩 중...</div> : (
                        <table className="dashboard-error-table" style={{width: '100%', margin: '0', borderCollapse: 'collapse'}}>
                            <thead style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                                <tr>
                                    <th style={{padding: '16px', textAlign: 'center'}}>ID</th>
                                    <th style={{padding: '16px'}}>발생 일시</th>
                                    <th style={{padding: '16px', textAlign: 'center'}}>유형</th>
                                    <th style={{padding: '16px', width: '35%'}}>에러 메시지</th>
                                    <th style={{padding: '16px', textAlign: 'center'}}>해결 상태</th>
                                    <th style={{padding: '16px'}}>해결 일시</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errorLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center', padding: '30px', color: '#777'}}>에러 로그가 없습니다.</td>
                                    </tr>
                                )}
                                {errorLogs.map(log => (
                                    <tr key={log.log_id} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '16px', textAlign: 'center'}}>{log.log_id}</td>
                                        <td style={{padding: '16px'}}>{new Date(log.created_at).toLocaleString()}</td>
                                        <td style={{padding: '16px', textAlign: 'center'}}>
                                            <span style={{
                                                color: log.error_type === 'ERROR' ? '#ef4444' : '#f5a623',
                                                fontWeight: 'bold',
                                                padding: '4px 8px',
                                                backgroundColor: log.error_type === 'ERROR' ? '#fee2e2' : '#fef3c7',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>{log.error_type}</span>
                                        </td>
                                        <td style={{padding: '16px', fontSize: '13px', color: '#374151'}}>{log.error_message}</td>
                                        <td style={{padding: '16px', textAlign: 'center'}}>
                                            <button 
                                                onClick={() => handleResolveToggle(log.log_id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: '1px solid',
                                                    borderColor: log.is_resolved === 1 ? '#10b981' : '#d1d5db',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    backgroundColor: log.is_resolved === 1 ? '#10b981' : 'white',
                                                    color: log.is_resolved === 1 ? 'white' : '#4b5563',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                {log.is_resolved === 1 ? '해결됨' : '미해결'}
                                            </button>
                                        </td>
                                        <td style={{padding: '16px', fontSize: '13px', color: '#6b7280'}}>{log.resolved_at ? new Date(log.resolved_at).toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
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

export default ErrorLogs;