import React, { useState, useEffect, useCallback } from 'react';
import { reportService, groupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    GitCommit,
    TrendingUp,
    Calendar,
    Zap,
    Award
} from 'lucide-react';

const ContributionTracking = () => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const [contributions, setContributions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupInfo, setGroupInfo] = useState(null);

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            const nhomId = user?.['idNhom'];

            if (nhomId) {
                const groupRes = await groupService.getDetails(nhomId);
                setGroupInfo(groupRes.data);
                const [contribRes, historyRes] = await Promise.all([
                    reportService.getContributions(nhomId),
                    reportService.getCommitHistory(nhomId)
                ]);
                setContributions(Array.isArray(contribRes.data) ? contribRes.data : []);
                setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            } else {
                const groupsRes = await groupService.getAll();
                const allGroups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
                const myGroup = allGroups.find(g =>
                    g['thanhViens']?.some(m => m['idSinhVien'] === user?.id)
                );
                if (myGroup) {
                    setGroupInfo(myGroup);
                    const [contribRes, historyRes] = await Promise.all([
                        reportService.getContributions(myGroup['idNhom']),
                        reportService.getCommitHistory(myGroup['idNhom'])
                    ]);
                    setContributions(Array.isArray(contribRes.data) ? contribRes.data : []);
                    setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
                }
            }
        } catch (err) {
            console.error('Analytics Error:', err);
            showToast('Không thể kết nối tới dữ liệu đóng góp.', 'danger');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        if (user?.id) {
            fetchAnalyticsData().catch(e => console.error("Fetch failure", e));
        }
    }, [user, fetchAnalyticsData]);

    const getHeatmapColor = (count) => {
        if (count === 0) return 'rgba(255,255,255,0.03)';
        if (count <= 1) return '#1e3a8a';
        if (count <= 3) return '#3b82f6';
        if (count <= 5) return '#60a5fa';
        return 'var(--primary)';
    };

    if (loading && !groupInfo) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ dữ liệu GitHub & Jira...</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Phân tích Đóng góp</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Dữ liệu thời gian thực từ các nền tảng quản lý dự án</p>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800' }}>
                    Nhóm: {groupInfo ? groupInfo['tenNhom'] : 'N/A'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Chart 1: Commits */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                            <GitCommit size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Thống kê Commits</h3>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contributions}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                                <XAxis
                                    dataKey="tenSinhVien"
                                    fontSize={11}
                                    stroke="var(--text-muted)"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    fontSize={11}
                                    stroke="var(--text-muted)"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="soCommit" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40}>
                                    {contributions.map((entry, index) => (
                                        < cell key={`cell-${index}`} fillOpacity={entry['idSinhVien'] === user?.id ? 1 : 0.4} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Jira Tasks */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Nhiệm vụ Hoàn thành</h3>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contributions}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                                <XAxis
                                    dataKey="tenSinhVien"
                                    fontSize={11}
                                    stroke="var(--text-muted)"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    fontSize={11}
                                    stroke="var(--text-muted)"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="soNhiemVuHoanThanh" fill="var(--success)" radius={[6, 6, 0, 0]} barSize={40}>
                                    {contributions.map((entry, index) => (
                                        <cell key={`cell-${index}`} fillOpacity={entry['idSinhVien'] === user?.id ? 1 : 0.4} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Heatmap Area */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar size={20} color="var(--primary)" />
                            Lịch sử Hoạt động
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        {history.length > 0 ? history.map((day, i) => (
                            <div
                                key={i}
                                title={`${day['count']} commits vào ${day['date'] || 'N/A'}`}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    background: getHeatmapColor(day['count']),
                                    transition: 'all 0.2s'
                                }}
                            ></div>
                        )) : (
                            <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có dữ liệu hoạt động.</p>
                            </div>
                        )}
                    </div>

                    <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                {/* Fix Deprecated Tags: Sử dụng props thay thế hide */}
                                <XAxis
                                    dataKey="date"
                                    tick={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--primary)"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={18} color="var(--warning)" />
                            Thành tích Nhóm
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {contributions.slice(0, 1).map((top, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                        <Zap size={20} fill="black" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>CÁ NHÂN NỔ LỰC</p>
                                        <p style={{ fontWeight: '800' }}>{top['tenSinhVien']}</p>
                                    </div>
                                </div>
                            ))}
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--warning)' }}>
                                Hệ thống ghi nhận tiến độ nhóm đang diễn ra đúng kế hoạch.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionTracking;