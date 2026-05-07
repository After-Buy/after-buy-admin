import { useEffect, useState } from "react"
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Tooltip, 
  Sector,
  LabelList
} from 'recharts';



type UserStats = {
    total_users: number;
    new_users_7d: number;
    new_users_7d_change_rate: number;
    change_direction: string;
};

type OcrStats = {
    total_attempts: number;
    success_count: number;
    modified_count: number;
    failure_count: number;
    success_rate: number;
};

type Announcement = {
    announcement_id: number;
    title: string;
    category: string;
    created_at: string;
    is_pinned?: number;
};

type ErrorLog = {
    log_id: number;
    error_type: string;
    error_message: string;
    created_at: string;
};

function Dashboard() {
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [ocrStats, setOcrStats] = useState<OcrStats | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [errorCount, setErrorCount] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const categoryLabels: Record<string, string> = {
        NOTICE: "안내",
        MAINTENANCE: "점검",
        UPDATE: "업데이트"
    };

    const colors = ['#49aaff', '#FF8042','#ff4343'];

    const customSector = (props: any) => (
        <Sector {...props} fill={colors[props.index % colors.length]} />
    );



    useEffect(() => {
        axios.get('/api/admin/dashboard', { withCredentials: true })
            .then(response => {
                if (response.data.success) {
                    const data = response.data.data;
                    setUserStats(data.user_stats);
                    setOcrStats(data.ocr_stats);
                    setAnnouncements(data.recent_announcements);
                    setErrorLogs(data.unresolved_error_logs);
                    setErrorCount(data.unresolved_error_count);
                }
            })
            .catch(error => {
                console.error('대시보드 데이터 로드 오류:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
            
        // mock data for OCR pie chart   
        setTimeout(() => { 
            setOcrStats({
                total_attempts: 1000,
                success_count: 850,
                modified_count: 100,
                failure_count: 50,
                success_rate: 85
            });
            setUserStats({
                total_users: 150,
                new_users_7d: 13,
                new_users_7d_change_rate: 12.3,
                change_direction: 'UP'
            });
        }, 100);
    }, []);

    if (isLoading) return <div>로딩 중...</div>;

    return (
        <>
            <h2>대시보드</h2>
            <div className="container">
                <div className="row">
                    <div className="card stats">
                        <h5>전체 사용자</h5>
                        <h2>{userStats?.total_users?.toLocaleString() || 0}명</h2>
                    </div>
                    <div className="card stats">
                        <h5>신규 사용자</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2>{userStats?.new_users_7d?.toLocaleString() || 0}명</h2>
                            <span style={{ color: userStats?.change_direction === 'UP' ? 'green' : 'red', fontSize: '14px', fontWeight: 'bold' }}>
                                {userStats?.change_direction === 'UP' ? '▲' : '▼'} {userStats?.new_users_7d_change_rate || 0}%
                            </span>
                        </div>
                    </div>
                    <div className="card stats">
                        <h5>에러 로그 현황</h5>
                        <h2>{errorCount.toLocaleString()}건</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="card ocr">
                        <h5>OCR 인식률</h5>
                        {ocrStats ? (
                            <div className="dashboard-ocr-table">
                                <PieChart
                                    responsive
                                    style={{ width: '100%', maxWidth: 360, aspectRatio: 1 }}
                                    >
                                    <Pie
                                        data={ocrStats ? [
                                            { name: '성공', value: ocrStats.success_count },
                                            { name: '오인식', value: ocrStats.modified_count },
                                            { name: '실패', value: ocrStats.failure_count }
                                        ] : []}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="75%"
                                        shape={customSector}
                                    >
                                        <LabelList dataKey="name" position="outside" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', marginTop: '20px' }}>
                                    <div className="dashboard-ocr-label">
                                        <div>
                                            <span className="dot" style={{backgroundColor: colors[0]}}
                                            />
                                            <span style={{ marginLeft: '10px'}}>성공</span>
                                        </div>
                                        <span>{ocrStats.success_count}건</span>
                                    </div>
                                    <div className="dashboard-ocr-label">
                                        <div>
                                            <span className="dot" style={{backgroundColor: colors[1]}}
                                            />
                                            <span style={{ marginLeft: '10px'}}>오인식</span>
                                        </div>
                                        <span>{ocrStats.modified_count}건</span>
                                    </div>
                                    <div className="dashboard-ocr-label">
                                        <div>
                                            <span className="dot" style={{backgroundColor: colors[2]}}
                                            />
                                            <span style={{ marginLeft: '10px'}}>실패</span>
                                        </div>
                                        <span>{ocrStats.failure_count}건</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: '20px', textAlign: 'center', color: '#999' }}>데이터 없음</div>
                        )}
                    </div>
                    <div className="card">
                        <h5>공지사항</h5>
                        <ul className="dashboard-notice-list">
                            {announcements?.length === 0 && <li style={{ padding: '20px', color: '#aaa', justifyContent: 'center' }}>최근 등록된 공지가 없습니다.</li>}
                            {announcements?.map((item) => (
                                <li key={item.announcement_id}>
                                    <Link to={`/notice/${item.announcement_id}`}>
                                        <span style={{ fontWeight: '500' }}>
                                            <span style={{ color: '#888', marginRight: '5px' }}>[{categoryLabels[item.category]}]</span>
                                            {item.title}
                                        </span>
                                        <span className="notice-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="card error">
                    <h5>미해결 에러 로그</h5>
                    <table className="dashboard-error-table">
                        <thead>
                            <tr>
                                <th>발생 일시</th>
                                <th>에러 유형</th>
                                <th>에러 메시지</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errorLogs.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>미해결 에러가 없습니다.</td>
                                </tr>
                            )}
                            {errorLogs.map(log => (
                                <tr key={log.log_id}>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            color: log.error_type === 'ERROR' ? '#ef4444' : '#f5a623',
                                            fontWeight: 'bold',
                                            padding: '4px 8px',
                                            backgroundColor: log.error_type === 'ERROR' ? '#fee2e2' : '#fef3c7',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>{log.error_type}</span>
                                    </td>
                                    <td>{log.error_message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}

export default Dashboard