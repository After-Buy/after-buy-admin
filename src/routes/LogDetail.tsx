import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export type LoginLogDetail = {
    log_id: number;
    admin_id: number;
    admin_account: string;
    is_success: number;
    failure_reason: string | null;
    login_status: string;
    login_at: string;
    ip_address?: string;
    user_agent?: string;
};

function LogDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [detail, setDetail] = useState<LoginLogDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);

        const fallbackFetchList = async () => {
            try {
                // MSW나 백엔드에서 단일 상세 조회 API가 없을 경우를 대비해 리스트에서 찾기
                const res = await axios.get('/api/admin/login-logs', { 
                    params: { page: 1, size: 100 }, // 충분히 큰 사이즈로 1페이지에서 탐색 (임시 폴백)
                    withCredentials: true 
                });
                
                if (res.data.success && res.data.data && res.data.data.login_logs) {
                    const found = res.data.data.login_logs.find((log: any) => log.log_id === Number(id));
                    if (found) {
                        setDetail(found);
                        setErrorMsg('');
                        return;
                    }
                }
                setDetail(null);
                setErrorMsg("해당 로그 데이터를 찾을 수 없습니다.");
            } catch (err) {
                console.error("폴백 로드 오류", err);
                setDetail(null);
                setErrorMsg("데이터를 불러올 수 없습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        axios.get(`/api/admin/login-logs/${id}`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setDetail(res.data.data);
                    setErrorMsg('');
                    setIsLoading(false);
                } else {
                    fallbackFetchList();
                }
            })
            .catch(err => {
                console.error("로그인 내역 상세 로드 오류", err);
                fallbackFetchList();
            });
    }, [id]);

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (errorMsg || !detail) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{errorMsg || "데이터가 없습니다."}</div>;

    return (
        <div className="log-page">
            <h2 style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => navigate('/log')}>
                관리자 접속 내역 상세
            </h2>

            <div className="container" style={{ marginTop: '30px' }}>
                <div className="card" style={{ padding: '30px' }}>
                    <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{
                                        color: detail.is_success === 1 ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold',
                                        padding: '4px 10px',
                                        backgroundColor: detail.is_success === 1 ? '#d1fae5' : '#fee2e2',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}>
                                        {detail.is_success === 1 ? '로그인 성공' : '로그인 실패'}
                                    </span>
                                    <h3 style={{ margin: 0, fontSize: '22px', color: '#111827' }}>접속 내역 상세 정보 (ID: {detail.log_id})</h3>
                                </div>
                                <div style={{ fontSize: '15px', color: '#6b7280', display: 'flex', gap: '20px' }}>
                                    <span>접속 일시: {new Date(detail.login_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '20px 10px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '15px' }}>관리자 계정 ID</div>
                        <div style={{ color: '#111827', fontSize: '15px', fontWeight: '500' }}>
                            {detail.admin_account} <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '14px' }}>(고유 ID: {detail.admin_id})</span>
                        </div>

                        <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '15px' }}>접속 상태</div>
                        <div>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                backgroundColor: detail.login_status === '접속 중' ? '#d1fae5' : '#f3f4f6',
                                color: detail.login_status === '접속 중' ? '#047857' : '#4b5563',
                                fontSize: '13px',
                                fontWeight: 'bold'
                            }}>
                                {detail.login_status}
                            </span>
                        </div>

                        {detail.is_success === 0 && detail.failure_reason && (
                            <>
                                <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '15px' }}>실패 사유</div>
                                <div style={{ color: '#ef4444', fontSize: '15px', fontWeight: '500', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                                    {detail.failure_reason}
                                </div>
                            </>
                        )}

                        {detail.ip_address && (
                            <>
                                <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '15px' }}>접속 IP</div>
                                <div style={{ color: '#111827', fontSize: '15px' }}>{detail.ip_address}</div>
                            </>
                        )}

                        {detail.user_agent && (
                            <>
                                <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '15px', alignSelf: 'flex-start', marginTop: '10px' }}>User Agent</div>
                                <div style={{ color: '#4b5563', fontSize: '14px', wordBreak: 'break-all', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', border: '1px solid #f3f4f6', lineHeight: '1.5' }}>
                                    {detail.user_agent}
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={() => navigate('/log')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#43ABE5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '15px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                boxShadow: '0 2px 4px rgba(67, 171, 229, 0.2)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3192cd'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#43ABE5'}
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LogDetail;
