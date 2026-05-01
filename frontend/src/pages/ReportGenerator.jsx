import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { reportService, taskService, groupService } from '../services/api';
import {
    Download,
    Printer,
    FileDown,
    Settings,
    Eye,
    CheckCircle2
} from 'lucide-react';

/**
 * @typedef {Object} Member
 * @property {string} idSinhVien
 * @property {string} hoTen
 * @property {string} maSv
 */

/**
 * @typedef {Object} Group
 * @property {string} idNhom
 * @property {string} tenNhom
 * @property {string} keyJira
 * @property {string} deTai
 * @property {string} idTruongNhom
 * @property {Member[]} thanhViens
 */

/**
 * @typedef {Object} Task
 * @property {string} idYeuCau
 * @property {string} tieuDe
 * @property {string} trangThai
 * @property {string} tenSinhVien
 */

const ReportGenerator = () => {
    const { user } = useAuth();
    const { showToast } = useUI();

    /** @type {[Task[], Function]} */
    const [tasks, setTasks] = useState([]);
    /** @type {[Group | null, Function]} */
    const [groupInfo, setGroupInfo] = useState(null);

    const [template, setTemplate] = useState('srs');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const initReportData = useCallback(async () => {
        try {
            setLoading(true);
            const groupsRes = await groupService.getAll();
            /** @type {Group[]} */
            const allGroups = groupsRes.data || [];

            const myGroup = allGroups.find(g =>
                g.thanhViens?.some(m => m.idSinhVien === user?.id)
            );

            if (myGroup) {
                setGroupInfo(myGroup);
                const taskRes = await taskService.getGroupTasks(myGroup.idNhom);
                setTasks(taskRes.data || []);
            }
        } catch (err) {
            console.error('Lỗi khởi tạo báo cáo:', err);
            showToast('Không thể tải dữ liệu cho trình tạo báo cáo.', 'danger');
        } finally {
            setLoading(false);
        }
    }, [user?.id, showToast]);

    useEffect(() => {
        if (user?.id) {
            initReportData().catch(console.error);
        }
    }, [user?.id, initReportData]);

    const handleDownload = async (type) => {
        if (!groupInfo) return;
        try {
            setExporting(true);
            showToast(`Đang chuẩn bị file ${type.toUpperCase()}...`, 'info');

            let res;
            let filename = `${template}-nhom-${groupInfo.tenNhom}.${type}`;

            switch(type) {
                case 'csv':
                    res = await reportService.exportCsv(groupInfo.idNhom);
                    filename = `bao-cao-nhom-${groupInfo.tenNhom}.csv`;
                    break;
                case 'srs':
                    res = await reportService.exportSRS(groupInfo.idNhom);
                    filename = `SRS-nhom-${groupInfo.tenNhom}.docx`;
                    break;
                case 'docx':
                    res = await reportService.exportDocx(groupInfo.idNhom);
                    break;
                case 'pdf':
                default:
                    res = await reportService.exportPdf(groupInfo.idNhom);
                    break;
            }

            if (res && res.data) {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                showToast('Tải xuống tài liệu thành công!', 'success');
            }
        } catch (err) {
            console.error(err);
            showToast('Lỗi khi xuất file báo cáo.', 'danger');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '1rem' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Đang soạn thảo tài liệu dự án...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <style>
                {`
          @media print {
            aside, nav, .no-print { display: none !important; }
            .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; background: white !important; color: black !important; border: none !important; }
            body { background: white !important; color: black !important; }
            * { color: black !important; border-color: #eee !important; box-shadow: none !important; }
            .glass-card { background: white !important; border: 1px solid #eee !important; }
          }
          .document-preview {
            background: white;
            color: #1f2937;
            padding: 50px 70px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            min-height: 1000px;
            width: 100%;
            max-width: 850px;
            margin: 0 auto;
            position: relative;
          }
        `}
            </style>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Report Studio</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tự động hóa tài liệu dự án từ Jira Cloud</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        <Printer size={18} /> In ngay
                    </button>
                    <button className="btn btn-outline" onClick={() => handleDownload('csv')} disabled={exporting}>
                        <FileDown size={18} /> CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => handleDownload(template === 'srs' ? 'srs' : 'pdf')} disabled={exporting}>
                        <Download size={18} /> {exporting ? 'Đang xuất...' : `Xuất ${template.toUpperCase()}`}
                    </button>
                </div>
            </div>

            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Settings size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Cấu hình Văn bản</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Loại tài liệu</label>
                                <select className="input-field" style={{ margin: 0, width: '100%' }} value={template} onChange={e => setTemplate(e.target.value)}>
                                    <option value="srs">Đặc tả Yêu cầu (SRS)</option>
                                    <option value="final">Báo cáo Tổng kết</option>
                                    <option value="test">Báo cáo Kiểm thử</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nhóm kết xuất</label>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{groupInfo?.tenNhom || 'N/A'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Key: {groupInfo?.keyJira || 'PRJ'}</p>
                                </div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '10px', display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} color="var(--success)" />
                                <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>Dữ liệu đã sẵn sàng.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
                            <Eye size={18} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Xem trước Tài liệu</span>
                        </div>

                        <div className="document-preview print-area" id="printable-doc">
                            <div style={{ textAlign: 'center', marginBottom: '50px', paddingBottom: '30px', borderBottom: '2px solid #111827' }}>
                                <p style={{ fontSize: '1rem', fontWeight: '700' }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</p>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '20px' }}>
                                    {template === 'srs' ? 'SOFTWARE REQUIREMENTS SPECIFICATION' : 'BÁO CÁO DỰ ÁN'}
                                </h1>
                                <p style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '10px' }}>Dự án: {groupInfo?.tenNhom}</p>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '15px' }}>1. TỔNG QUAN</h2>
                                <p style={{ lineHeight: '1.7' }}>Hệ thống hỗ trợ quản lý dự án tích hợp Jira & GitHub.</p>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '15px' }}>2. DANH SÁCH NHIỆM VỤ</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tiêu đề</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Trạng thái</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tasks.map((task, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{task.idYeuCau}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{task.tieuDe}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{task.trangThai}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;