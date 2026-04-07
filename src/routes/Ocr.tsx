import { useEffect, useState } from "react";
import axios from "axios";

type OcrSummary = {
    total_attempts: number;
    failure_count: number;
    modified_count: number;
    failure_rate: number;
    modified_rate: number;
};

type FieldStat = {
    field_name: string;
    modified_count: number;
    rate: number;
};

type DailyTrend = {
    date: string;
    failure_count: number;
};

function Ocr() {
    const [period, setPeriod] = useState("MONTH");
    const [summary, setSummary] = useState<OcrSummary | null>(null);
    const [fieldStats, setFieldStats] = useState<FieldStat[]>([]);
    const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = () => {
        setIsLoading(true);
        axios.get('/api/admin/ocr-stats', {
            params: { period },
            withCredentials: true
        })
        .then(res => {
            if (res.data.success) {
                const d = res.data.data;
                setSummary(d.summary);
                setFieldStats(d.field_modified_stats);
                setDailyTrend(d.daily_failure_trend);
            }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchStats();
    }, [period]);

    return (
        <div className="ocr-page">
            <h2>OCR 처리 통계</h2>
            
            <div className="container" style={{marginTop: '30px'}}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <select 
                        style={{padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold'}}
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="WEEK">최근 7일</option>
                        <option value="MONTH">최근 30일</option>
                        <option value="ALL">전체</option>
                    </select>
                </div>

                {isLoading ? <div style={{padding: '50px', textAlign: 'center', color: '#777'}}>로딩 중...</div> : (
                    <>
                        <div className="row">
                            <div className="card stats">
                                <h5>총 시도 건수</h5>
                                <h2 style={{marginTop: '10px'}}>{summary?.total_attempts?.toLocaleString() || 0}건</h2>
                            </div>
                            <div className="card stats">
                                <h5>수정된 건수</h5>
                                <h2 style={{marginTop: '10px'}}>{summary?.modified_count?.toLocaleString() || 0}건</h2>
                                <span style={{color: '#f5a623', fontSize: '14px', fontWeight: 'bold'}}>
                                    수정률: {summary?.modified_rate || 0}%
                                </span>
                            </div>
                            <div className="card stats">
                                <h5>실패 건수</h5>
                                <h2 style={{marginTop: '10px'}}>{summary?.failure_count?.toLocaleString() || 0}건</h2>
                                <span style={{color: '#ef4444', fontSize: '14px', fontWeight: 'bold'}}>
                                    실패율: {summary?.failure_rate || 0}%
                                </span>
                            </div>
                        </div>

                        <div className="row" style={{marginTop: '20px'}}>
                            <div className="card">
                                <h5>주요 수정 필드 통계</h5>
                                <table style={{width: '100%', marginTop: '15px', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                                            <th style={{padding: '10px', textAlign: 'left', color: '#6b7280'}}>필드명</th>
                                            <th style={{padding: '10px', textAlign: 'right', color: '#6b7280'}}>수정 건수</th>
                                            <th style={{padding: '10px', textAlign: 'right', color: '#6b7280'}}>비율</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fieldStats.length === 0 && (
                                            <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px', color: '#777'}}>데이터가 없습니다.</td></tr>
                                        )}
                                        {fieldStats.map(stat => (
                                            <tr key={stat.field_name} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{padding: '12px', fontWeight: '500', color: '#374151'}}>{stat.field_name}</td>
                                                <td style={{padding: '12px', textAlign: 'right'}}>{stat.modified_count.toLocaleString()}</td>
                                                <td style={{padding: '12px', textAlign: 'right', color: '#888', fontWeight: 'bold'}}>{stat.rate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="card">
                                <h5>일자별 실패 추이</h5>
                                <table style={{width: '100%', marginTop: '15px', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                                            <th style={{padding: '10px', textAlign: 'left', color: '#6b7280'}}>일자</th>
                                            <th style={{padding: '10px', textAlign: 'right', color: '#6b7280'}}>실패 건수</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyTrend.length === 0 && (
                                            <tr><td colSpan={2} style={{textAlign: 'center', padding: '20px', color: '#777'}}>데이터가 없습니다.</td></tr>
                                        )}
                                        {dailyTrend.map(trend => (
                                            <tr key={trend.date} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{padding: '12px', color: '#374151'}}>{trend.date}</td>
                                                <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444'}}>{trend.failure_count.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Ocr;