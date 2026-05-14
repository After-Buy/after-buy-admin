import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type LoginLog = {
    log_id: number;
    admin_id: number;
    admin_account: string;
    is_success: number;
    failure_reason: string | null;
    login_status: string;
    login_at: string;
};

function Log() {
    const navigate = useNavigate();
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogs = () => {
        setIsLoading(true);
        axios.get('/api/admin/login-logs', {
            params: {
                page: pagination.current_page,
                size: 10
            },
            withCredentials: true
        })
            .then(res => {
                if (res.data.success) {
                    setLoginLogs(res.data.data.login_logs);
                    setPagination(res.data.data.pagination);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchLogs();
    }, [pagination.current_page]);

    return (
        <div className="log-page">
            <h2>관리자 접속 내역</h2>

            <div className="container" style={{ marginTop: '30px' }}>
                <div className="card error" style={{ overflow: 'hidden' }}>
                    {isLoading ? <div style={{ padding: '50px', textAlign: 'center', color: '#777' }}>로딩 중...</div> : (
                        <table style={{ width: '100%', margin: '0', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'center', color: '#556978', fontWeight: 'bold' }}>로그 번호</th>
                                    <th style={{ padding: '16px', textAlign: 'center', color: '#556978', fontWeight: 'bold' }}>ID</th>
                                    <th style={{ padding: '16px', textAlign: 'center', color: '#556978', fontWeight: 'bold' }}>로그인 일시</th>
                                    <th style={{ padding: '16px', textAlign: 'center', color: '#556978', fontWeight: 'bold' }}>결과</th>
                                    <th style={{ padding: '16px', textAlign: 'center', color: '#556978', fontWeight: 'bold' }}>접속 상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>데이터가 없습니다.</td>
                                    </tr>
                                )}
                                {loginLogs.map(log => (
                                    <tr key={log.log_id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => navigate(`/log/${log.log_id}`)}>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>{log.log_id}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500' }}>{log.admin_account}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>{new Date(log.login_at).toLocaleString()}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            {log.is_success === 1 ? (
                                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>성공</span>
                                            ) : (
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>실패</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: log.login_status === '접속 중' ? '#d1fae5' : '#f3f4f6',
                                                color: log.login_status === '접속 중' ? '#047857' : '#4b5563',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>{log.login_status}</span>
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {pagination.total_pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px 0' }}>
                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: pageNum }))}
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

export default Log;