import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reportService, groupService } from '../services/api';
import { useUI } from '../context/UIContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Download,
  Filter,
  Users,
  TrendingUp,
  GitCommit,
  Activity,
  ArrowLeft,
  FileDown,
  Award,
  Zap
} from 'lucide-react';

/**
 * @typedef {Object} ProgressSummary
 * @property {number} phanTramTienDo
 * @property {number} nhiemVuHoanThanh
 * @property {number} tongSoNhiemVu
 */

/**
 * @typedef {Object} MemberContribution
 * @property {string} idSinhVien
 * @property {string} tenSinhVien
 * @property {number} soNhiemVuHoanThanh
 * @property {number} soCommit
 */

/**
 * @typedef {Object} CommitResponse
 * @property {Object.<string, number>} soCommitTheoSinhVien
 */

const TeacherReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const queryParams = new URLSearchParams(location.search);
  const nhomId = queryParams.get('nhomId');

  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  /** @type {[ProgressSummary | null, Function]} */
  const [progressSummary, setProgressSummary] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [gitStats, setGitStats] = useState([]);
  /** @type {[MemberContribution[], Function]} */
  const [contributions, setContributions] = useState([]);

  const fetchReportData = useCallback(async () => {
    if (!nhomId) return;
    try {
      setLoading(true);
      const [infoRes, progressRes, historyRes, gitRes, contribRes] = await Promise.all([
        groupService.getDetails(nhomId),
        reportService.getProgress(nhomId),
        reportService.getHistory(nhomId),
        reportService.getCommits(nhomId),
        reportService.getContributions(nhomId)
      ]);

      setGroupInfo(infoRes.data);
      setProgressSummary(progressRes.data);
      setHistoryData(historyRes.data || []);
      setContributions(contribRes.data || []);

      /** @type {CommitResponse} */
      const gitData = gitRes.data || {};
      const commitMap = gitData.soCommitTheoSinhVien || {};

      const formattedGitData = Object.keys(commitMap).map(key => ({
        username: key,
        commits: commitMap[key]
      }));
      setGitStats(formattedGitData);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      showToast('Có lỗi khi trích xuất dữ liệu báo cáo.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [nhomId, showToast]);

  useEffect(() => {
    if (nhomId) {
      fetchReportData().catch(console.error);
    }
  }, [fetchReportData, nhomId]);

  const handleExport = async (format) => {
    if (!nhomId) return;
    try {
      showToast(`Đang khởi tạo tệp ${format.toUpperCase()}...`, 'info');
      const res = format === 'pdf'
          ? await reportService.exportPdf(nhomId)
          : await reportService.exportDocx(nhomId);

      if (res && res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bao-cao-nhom-${groupInfo?.tenNhom || 'export'}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast('Xuất báo cáo thành công!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xuất file báo cáo.', 'danger');
    }
  };

  if (!nhomId) return (
      <div className="glass-card animate-fade-in" style={{ padding: '6rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Filter size={48} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '2rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Chọn nhóm để xem phân tích</h3>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/classes')}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>
      </div>
  );

  if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tổng hợp dữ liệu phân tích...</p>
      </div>
  );

  const stats = [
    { label: 'Tiến độ hoàn thành', value: `${progressSummary?.phanTramTienDo || 0}%`, sub: `${progressSummary?.nhiemVuHoanThanh || 0}/${progressSummary?.tongSoNhiemVu || 0} Nhiệm vụ`, icon: TrendingUp, color: 'var(--success)' },
    { label: 'Tổng số Commits', value: gitStats.reduce((acc, curr) => acc + curr.commits, 0), sub: 'Dữ liệu từ GitHub', icon: GitCommit, color: 'var(--accent)' },
    { label: 'Thành viên nhóm', value: groupInfo?.soLuongThanhVien || '0', sub: 'Đang hoạt động', icon: Users, color: 'var(--primary)' },
    { label: 'Điểm nỗ lực', value: '8.5', sub: 'Dựa trên Task/Commit', icon: Award, color: 'var(--warning)' },
  ];

  return (
      <div className="animate-fade-in">
        <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-area { width: 100% !important; background: white !important; color: black !important; }
        }
      `}} />

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <button onClick={() => navigate('/teacher/classes')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem' }}>
              <ArrowLeft size={16} /> Quay lại Lớp học
            </button>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Phân tích Dự án: {groupInfo?.tenNhom}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Đề tài: <span style={{ color: 'white', fontWeight: '600' }}>{groupInfo?.deTai || 'Chưa cập nhật'}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => handleExport('docx')}><FileDown size={18} /> Word</button>
            <button className="btn btn-primary" onClick={() => handleExport('pdf')}><Download size={18} /> Xuất PDF</button>
          </div>
        </div>

        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
                <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <IconComponent size={20} style={{ color: stat.color }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
                </div>
            );
          })}
        </div>

        <div className="grid-layout no-print" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={20} color="var(--primary)" /> Lịch sử Phát triển
            </h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="ngay" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--surface-border)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="hoanThanh" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GitCommit size={20} color="var(--accent)" /> Phân bổ Commits
            </h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gitStats} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="username" type="category" stroke="var(--text-muted)" fontSize={11} width={100} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="commits" radius={[0, 6, 6, 0]} barSize={24}>
                    {gitStats.map((entry, index) => (
                        <cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card no-print" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={20} color="var(--warning)" /> Bảng xếp hạng Đóng góp
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Vị trí</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Thành viên</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Tasks</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Commits</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Trạng thái</th>
            </tr>
            </thead>
            <tbody>
            {contributions.map((m, i) => (
                <tr key={i} className="table-row-hover" style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '15px', fontWeight: '800' }}>#{i + 1}</td>
                  <td style={{ padding: '15px' }}>
                    <p style={{ fontWeight: '700' }}>{m.tenSinhVien}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.idSinhVien}</p>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700' }}>{m.soNhiemVuHoanThanh}</td>
                  <td style={{ padding: '15px', textAlign: 'center', color: 'var(--accent)', fontWeight: '700' }}>{m.soCommit}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', background: m.soNhiemVuHoanThanh > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.soNhiemVuHoanThanh > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.7rem', fontWeight: '800' }}>
                    {m.soNhiemVuHoanThanh > 0 ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default TeacherReports;