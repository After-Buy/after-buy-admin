import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export type ErrorLogDetail = {
    log_id: number;
    error_type: string;
    error_message: string;
    full_message: string;
    is_resolved: number;
    resolved_at: string | null;
    created_at: string;
};

function ErrorDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [detail, setDetail] = useState<ErrorLogDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!id) return;

        // 상세 페이지로 넘어갈 때 전달받은 로그 데이터 사용
        if (location.state && location.state.log) {
            setDetail(location.state.log);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const fallbackFetchList = async () => {
            try {
                const res = await axios.get('/api/admin/error-logs', {
                    params: { page: 1, size: 100 },
                    withCredentials: true
                });

                if (res.data.success && res.data.data && res.data.data.error_logs) {
                    const found = res.data.data.error_logs.find((log: any) => log.log_id === Number(id));
                    if (found) {
                        setDetail(found);
                        setErrorMsg('');
                        return;
                    }
                }

                setDetail(null);
                setErrorMsg(`해당 에러 로그(ID: ${id})를 찾을 수 없거나 오래된 데이터입니다. 목록에서 다시 접근해주세요.`);
            } catch (err) {
                setDetail(null);
                setErrorMsg("데이터를 불러올 수 없습니다. " + err);
            } finally {
                setIsLoading(false);
            }
        };

        fallbackFetchList();
    }, [id, location.state]);

    const handleResolveToggle = async () => {
        if (!detail) return;
        try {
            await axios.patch(`/api/admin/error-logs/${id}/resolve`, {}, { withCredentials: true });
            setDetail(prev => prev ? {
                ...prev,
                is_resolved: prev.is_resolved === 1 ? 0 : 1,
                resolved_at: prev.is_resolved === 1 ? null : new Date().toISOString()
            } : null);
        } catch (e) {
            console.error("해결상태 변경 오류", e);
        }
    }

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (errorMsg || !detail) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg || "데이터가 없습니다."}</div>;

    return (
        <div className="error-page">
            <h2 style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => navigate('/error')}>에러 로그</h2>

            <div className="container" style={{ marginTop: '30px' }}>
                <div className="card" style={{ padding: '30px' }}>
                    <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <span style={{
                                        color: detail.error_type === 'ERROR' ? '#ef4444' : '#f5a623',
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        backgroundColor: detail.error_type === 'ERROR' ? '#fee2e2' : '#fef3c7',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        {detail.error_type}
                                    </span>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>에러 상세 정보 (ID: {detail.log_id})</h3>
                                </div>
                                <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', gap: '20px' }}>
                                    <span>발생 일시: {new Date(detail.created_at).toLocaleString()}</span>
                                    <span>해결 일시: {detail.resolved_at ? new Date(detail.resolved_at).toLocaleString() : '-'}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleResolveToggle}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid',
                                    borderColor: detail.is_resolved === 1 ? '#10b981' : '#d1d5db',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: detail.is_resolved === 1 ? '#10b981' : 'white',
                                    color: detail.is_resolved === 1 ? 'white' : '#374151',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {detail.is_resolved === 1 ? '해결됨' : '미해결'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#374151' }}>에러 메시지</h4>
                        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6', color: '#111827', fontWeight: '500' }}>
                            {detail.error_message}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#374151' }}>상세 내용 / 스택 트레이스</h4>
                        <pre style={{
                            padding: '20px',
                            backgroundColor: '#1f2937',
                            color: '#f3f4f6',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}>
                            {detail.full_message}
                        </pre>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/error')}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#43ABE5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ErrorDetail;
