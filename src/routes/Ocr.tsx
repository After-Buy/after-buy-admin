import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    LabelList,
    Brush
} from "recharts";

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
    time: number;
    failure_count: number;
};

function Ocr() {
    const [period, setPeriod] = useState("30d");
    const [summary, setSummary] = useState<OcrSummary | null>(null);
    const [fieldStats, setFieldStats] = useState<FieldStat[]>([]);
    const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
    const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const totalFieldModifiedCount = fieldStats.reduce((acc, curr) => acc + curr.modified_count, 0);

    const fetchStats = () => {
        setIsLoading(true);
        // 임시 더미 데이터 사용
        setTimeout(() => {
            let m = 1;
            if (period === '3m') m = 3;
            if (period === '6m') m = 6;
            if (period === '1y') m = 12;

            setSummary({
                total_attempts: 100 * m,
                failure_count: 16 * m,
                modified_count: 35 * m,
                failure_rate: 16,
                modified_rate: 35
            });

            setFieldStats([
                { field_name: "상품명", modified_count: 12 * m, rate: 11.4 },
                { field_name: "모델명", modified_count: 25 * m, rate: 23.8 },
                { field_name: "브랜드", modified_count: 10 * m, rate: 9.5 },
                { field_name: "구매가격", modified_count: 30 * m, rate: 28.5 },
                { field_name: "구매처", modified_count: 28 * m, rate: 26.6 },
            ]);

            const trend: DailyTrend[] = [];
            const now = new Date();

            let days = 30;
            if (period === '3m') days = 90;
            if (period === '6m') days = 180;
            if (period === '1y') days = 365;

            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                d.setHours(0, 0, 0, 0);

                let base = 50;
                if (period === '3m') base = 150;
                if (period === '6m') base = 300;
                if (period === '1y') base = 600;

                trend.push({
                    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                    time: d.getTime(),
                    failure_count: Math.floor(Math.random() * base) + Math.floor(base * 0.2)
                });
            }
            setDailyTrend(trend);
            setIsLoading(false);
        }, 400);

        /* 실제 API 호출 시 사용할 코드
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
        */
    };

    useEffect(() => {
        fetchStats();
    }, [period]);

    return (
        <div className="ocr-page">
            <h2>OCR 오인식</h2>
            <div className="container">
                {isLoading ? <div style={{ padding: '50px', textAlign: 'center', color: '#777' }}>로딩 중...</div> : (
                    <>
                        <div className="row">
                            <div className="card stats">
                                <h5>OCR 시도 횟수</h5>
                                <h2 style={{ marginTop: '10px' }}>{summary?.total_attempts?.toLocaleString() || 0}건</h2>
                            </div>
                            <div className="card stats">
                                <h5>오인식 건수</h5>
                                <h2 style={{ marginTop: '10px' }}>{summary?.modified_count?.toLocaleString() || 0}건</h2>
                            </div>
                            <div className="card stats">
                                <h5>인식 실패 건수</h5>
                                <h2 style={{ marginTop: '10px' }}>{summary?.failure_count?.toLocaleString() || 0}건</h2>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '20px', padding: '30px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                                {['30d', '3m', '6m', '1y'].map((p, idx) => {
                                    const labels = ['30일', '3달', '6달', '1년'];
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: period === p ? '#e5e7eb' : 'transparent',
                                                fontWeight: period === p ? 'bold' : 'normal',
                                                color: '#374151',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {labels[idx]}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="row" style={{ width: '60%' }}>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ textAlign: 'center', marginBottom: '20px', color: '#374151', fontWeight: 'bold' }}>항목별 오인식 건수</h5>
                                    <div style={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={fieldStats} margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis dataKey="field_name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f3f4f6' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    formatter={(value: any) => {
                                                        const numValue = Number(value);
                                                        const percent = totalFieldModifiedCount > 0 ? ((numValue / totalFieldModifiedCount) * 100).toFixed(1) : 0;
                                                        return [`${numValue}건 (${percent}%)`, '오인식 건수'];
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
                                                <Bar dataKey="modified_count" fill="#9f7aea" radius={[4, 4, 0, 0]} barSize={40} name="오인식 건수">
                                                    <LabelList
                                                        dataKey="modified_count"
                                                        position="top"
                                                        fill="#6b7280"
                                                        fontSize={12}
                                                        formatter={(value: any) => {
                                                            const numValue = Number(value);
                                                            const percent = totalFieldModifiedCount > 0 ? ((numValue / totalFieldModifiedCount) * 100).toFixed(1) : 0;
                                                            return `${numValue}건 (${percent}%)`;
                                                        }}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>


                            </div>
                            <div className="row" style={{ marginTop: '50px' }}>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ textAlign: 'center', margin: '0 50px 0px 20px', color: '#374151', fontWeight: 'bold' }}>인식 실패 건수</h5>
                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={dailyTrend} margin={{ top: 20, right: 100, left: 50, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="time"
                                                    type="number"
                                                    scale="time"
                                                    domain={['dataMin', 'dataMax']}
                                                    tickFormatter={(timeStr) => {
                                                        const date = new Date(timeStr);
                                                        const daysVisible = brushRange.endIndex ? brushRange.endIndex - brushRange.startIndex : dailyTrend.length;
                                                        if (daysVisible > 60) {
                                                            return `${date.getFullYear().toString().slice(2)}년 ${date.getMonth() + 1}월`;
                                                        }
                                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                                    }}
                                                    axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10}
                                                    minTickGap={30}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <Tooltip
                                                    labelFormatter={(label) => {
                                                        const d = new Date(label);
                                                        return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
                                                    }}
                                                    formatter={(value: any, name: any) => [`${value}건`, name]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" verticalAlign="top" />
                                                <Line type="monotone" dataKey="failure_count" stroke="#9f7aea" strokeWidth={2} dot={period === '30d' ? { stroke: '#9f7aea', strokeWidth: 2, fill: 'white', r: 4 } : false} activeDot={{ r: 6, fill: '#9f7aea' }} name="인식 실패 건수" />
                                                <Brush dataKey="time" tickFormatter={(timeStr) => {
                                                    const date = new Date(timeStr);
                                                    return `${date.getFullYear().toString().slice(2)}년 ${date.getMonth() + 1}월`;
                                                }} height={30} stroke="#9f7aea" fill="#f3f4f6" onChange={(e) => setBrushRange(prev => {
                                                    const newStart = e.startIndex || 0;
                                                    const newEnd = e.endIndex || 0;
                                                    if (prev.startIndex === newStart && prev.endIndex === newEnd) return prev;
                                                    return { startIndex: newStart, endIndex: newEnd };
                                                })} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Ocr;