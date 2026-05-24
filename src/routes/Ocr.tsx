import { useEffect, useState } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    Brush,
    PieChart,
    Pie,
    Cell
} from "recharts";
import axios from "axios";

type ChartPeriod = "WEEK" | "MONTH" | "ALL";

type OcrSummary = {
    total_attempts: number;
    failure_count: number;
    modified_count: number;
    failure_rate: number;
    modified_rate: number;
};

type FieldModifiedStat = {
    field_name: string;
    modified_count: number;
    rate: number;
};

type FieldFailureStat = {
    field_name: string;
    failure_count: number;
    rate: number;
};

type DailyFailureTrendResponse = {
    date: string;
    failure_count: number;
};

type DailyResultTrendResponse = {
    date: string;
    success_count: number;
    failure_count: number;
    modified_count: number;
    total_attempts: number;
    success_rate?: number;
};

type DailyTrend = {
    date: string;
    time: number;
    total_attempts: number;
    success_count: number;
    failure_count: number;
    modified_count: number;
    success_rate: number;
};

type OcrStatsResponse = {
    period: ChartPeriod;
    summary: OcrSummary;
    field_modified_stats: FieldModifiedStat[];
    field_failure_stats: FieldFailureStat[];
    daily_failure_trend: DailyFailureTrendResponse[];
    daily_result_trend: DailyResultTrendResponse[];
};

type PieStatItem = {
    name: string;
    value: number;
    rate: number;
};

const MODIFIED_PIE_COLORS = ['#7c3aed', '#2563eb', '#059669', '#f59e0b', '#dc2626', '#0891b2', '#9333ea'];
const FAILURE_PIE_COLORS = ['#dc2626', '#f97316', '#008006', '#be123c', '#9333ea', '#2563eb', '#475569'];

const toSafeNumber = (value: unknown) => {
    const numberValue = Number(value ?? 0);
    return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatKoreanDate = (value: string | number) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const renderPieLabel = ({ value, percent, x, y }: any) => {
    if (!value || percent <= 0.03) return null;

    return (
        <text x={x} y={y} fill="#4b5563" fontSize={12} textAnchor="middle" dominantBaseline="central">
            {((percent ?? 0) * 100).toFixed(1)}%
        </text>
    );
};

const getSuccessRate = (successCount: number, totalAttempts: number) => {
    const denominator = totalAttempts;
    if (denominator <= 0) return 0;
    return (successCount / denominator) * 100;
};

function EmptyChart() {
    return (
        <div style={{ height: '100%', minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>
            표시할 데이터가 없습니다
        </div>
    );
}

function PieStatList({ data, colors }: { data: PieStatItem[]; colors: string[] }) {
    return (
        <div className="ocr-pie-list">
            {data.map((item, index) => (
                <div className="ocr-pie-list-item" key={item.name}>
                    <span className="ocr-pie-list-dot" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="ocr-pie-list-name" title={item.name}>{item.name}</span>
                    <span className="ocr-pie-list-value">{item.value.toLocaleString()}건</span>
                    <span className="ocr-pie-list-rate">{item.rate.toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
}

function SuccessRateTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload as DailyTrend;

    return (
        <div style={{
            minWidth: 180,
            padding: '14px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            color: '#374151',
            fontSize: 13
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{formatKoreanDate(data.date)}</div>
            <div style={{ display: 'grid', gap: 6 }}>
                <div>전체 시도: {data.total_attempts.toLocaleString()}건</div>
                <div>성공 건수: {data.success_count.toLocaleString()}건</div>
                <div>실패 건수: {data.failure_count.toLocaleString()}건</div>
                <div>오인식 건수: {data.modified_count.toLocaleString()}건</div>
                <div style={{ color: '#6b46c1', fontWeight: 'bold' }}>성공률: {data.success_rate.toFixed(1)}%</div>
            </div>
        </div>
    );
}

function Ocr() {
    const [period, setPeriod] = useState<ChartPeriod>("MONTH");
    const [summary, setSummary] = useState<OcrSummary | null>(null);
    const [fieldModifiedStats, setFieldModifiedStats] = useState<FieldModifiedStat[]>([]);
    const [fieldFailureStats, setFieldFailureStats] = useState<FieldFailureStat[]>([]);
    const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
    const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const fieldModifiedPieData = fieldModifiedStats.map(item => ({
        name: item.field_name,
        value: toSafeNumber(item.modified_count),
        rate: toSafeNumber(item.rate)
    }));
    const fieldFailurePieData = fieldFailureStats.map(item => ({
        name: item.field_name,
        value: toSafeNumber(item.failure_count),
        rate: toSafeNumber(item.rate)
    }));
    const hasFieldModifiedStats = fieldModifiedPieData.some(item => item.value > 0);
    const hasFieldFailureStats = fieldFailurePieData.some(item => item.value > 0);
    const hasDailyTrend = dailyTrend.length > 0;

    const mapDailyResultTrend = (items: DailyResultTrendResponse[]) => items.map((item) => {
        const failureCount = toSafeNumber(item.failure_count);
        const modifiedCount = toSafeNumber(item.modified_count);
        const totalAttempts = toSafeNumber(item.total_attempts);
        const successCount = toSafeNumber(item.success_count);
        const calculatedSuccessRate = getSuccessRate(successCount, totalAttempts);

        return {
            date: item.date,
            time: new Date(item.date).getTime(),
            total_attempts: totalAttempts,
            success_count: successCount,
            failure_count: failureCount,
            modified_count: modifiedCount,
            success_rate: item.success_rate !== undefined
                ? toSafeNumber(item.success_rate)
                : calculatedSuccessRate
        };
    });

    const fetchSummary = () => {
        axios.get('/api/admin/ocr-stats', {
            params: { period: "ALL" },
            withCredentials: true
        })
            .then(res => {
                if (res.data.success) {
                    setSummary(res.data.data.summary);
                }
            })
            .catch(err => console.error(err));
    };

    const fetchChartStats = () => {
        setIsLoading(true);

        axios.get('/api/admin/ocr-stats', {
            params: { period },
            withCredentials: true
        })
            .then(res => {
                if (res.data.success) {
                    const d = res.data.data as OcrStatsResponse;
                    setFieldModifiedStats(Array.isArray(d.field_modified_stats) ? d.field_modified_stats : []);
                    setFieldFailureStats(Array.isArray(d.field_failure_stats) ? d.field_failure_stats : []);
                    setDailyTrend(mapDailyResultTrend(Array.isArray(d.daily_result_trend) ? d.daily_result_trend : []));
                    setBrushRange({ startIndex: 0, endIndex: 0 });
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));

    };

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchChartStats();
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
                                {(['WEEK', 'MONTH', 'ALL'] as ChartPeriod[]).map((p) => {
                                    const labels: Record<ChartPeriod, string> = {
                                        WEEK: '최근 7일',
                                        MONTH: '최근 30일',
                                        ALL: '전체'
                                    };
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
                                            {labels[p]}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="row" style={{ marginTop: '50px', marginBottom: '20px' }}>
                                <div className="ocr-line-chart" style={{ flex: 1 }}>
                                    <h5>성공률 그래프</h5>
                                    <div style={{ width: '100%', height: 350 }}>
                                        {hasDailyTrend ? (
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
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                                        domain={[0, 100]}
                                                        tickFormatter={(value) => `${toSafeNumber(value).toFixed(0)}%`}
                                                    />
                                                    <Tooltip content={<SuccessRateTooltip />} />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" verticalAlign="top" />
                                                    <Line type="monotone" dataKey="success_rate" stroke="#9f7aea" strokeWidth={2} dot={period === 'WEEK' ? { stroke: '#9f7aea', strokeWidth: 2, fill: 'white', r: 4 } : false} activeDot={{ r: 6, fill: '#9f7aea' }} name="성공률" unit="%" />
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
                                        ) : <EmptyChart />}
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{ width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <h5 className="ocr-pie-chart">항목별 오인식 건수</h5>
                                    <div className="ocr-pie-layout">
                                        {hasFieldModifiedStats ? (
                                            <>
                                                <div className="ocr-pie-canvas">
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie
                                                                data={fieldModifiedPieData}
                                                                dataKey="value"
                                                                nameKey="name"
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={95}
                                                                labelLine={false}
                                                                label={renderPieLabel}
                                                            >
                                                                {fieldModifiedPieData.map((entry, index) => (
                                                                    <Cell key={entry.name} fill={MODIFIED_PIE_COLORS[index % MODIFIED_PIE_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                formatter={(value: any, name: any) => [`${toSafeNumber(value).toLocaleString()}건`, name]}
                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <PieStatList data={fieldModifiedPieData} colors={MODIFIED_PIE_COLORS} />
                                            </>
                                        ) : <EmptyChart />}
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h5 className="ocr-pie-chart">항목별 실패 건수</h5>
                                    <div className="ocr-pie-layout">
                                        {hasFieldFailureStats ? (
                                            <>
                                                <div className="ocr-pie-canvas">
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie
                                                                data={fieldFailurePieData}
                                                                dataKey="value"
                                                                nameKey="name"
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={95}
                                                                labelLine={false}
                                                                label={renderPieLabel}
                                                            >
                                                                {fieldFailurePieData.map((entry, index) => (
                                                                    <Cell key={entry.name} fill={FAILURE_PIE_COLORS[index % FAILURE_PIE_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                formatter={(value: any, name: any) => [`${toSafeNumber(value).toLocaleString()}건`, name]}
                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <PieStatList data={fieldFailurePieData} colors={FAILURE_PIE_COLORS} />
                                            </>
                                        ) : <EmptyChart />}
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
