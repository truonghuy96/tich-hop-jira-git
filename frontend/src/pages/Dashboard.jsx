import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService, userService, taskService, reportService } from '../services/api';
import {
  CheckSquare, Trophy, Users, Settings, ArrowRight,
  Activity, Zap, Clock, LayoutGrid, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // KHỞI TẠO: Đảm bảo không có trường nào bị thiếu hoặc mang kiểu 'never'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    myGroups: [],
    studentTasks: { todo: 0, doing: 0, done: 0 },
    groupProgress: 0,
    topPerformers: []
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const role = user?.role?.toUpperCase();

      if (role === 'ADMIN') {
        const [uRes, gRes] = await Promise.all([userService.getAll(), groupService.getAll()]);
        const uData = Array.isArray(uRes.data) ? uRes.data : [];
        const gData = Array.isArray(gRes.data) ? gRes.data : [];

        setStats(prev => ({
          ...prev, // Giữ nguyên các giá trị mặc định cho studentTasks, myGroups...
          totalUsers: uData.length,
          totalGroups: gData.length,
          topPerformers: gData.slice(0, 5).map(g => ({
            name: String(g['tenNhom'] || "N/A"),
            progress: Number(g['tienDo'] || 0)
          }))
        }));
      }
      else if (role === 'GIANG_VIEN') {
        const res = await groupService.getByTeacher(user.id);
        const list = Array.isArray(res.data) ? res.data : [];
        setStats((prev) => ({
          ...prev,
          totalGroups: list.length,
          myGroups: list
        }));
      }
      else if (role === 'SINH_VIEN') {
        const myTasksRes = await taskService.getMine(user.id);
        const tasks = Array.isArray(myTasksRes.data) ? myTasksRes.data : [];

        let gInfo = [];
        let prog = 0;

        if (user['idNhom']) {
          const [gRes, pRes] = await Promise.allSettled([
            groupService.getDetails(user['idNhom']),
            reportService.getProgress(user['idNhom'])
          ]);
          if (gRes.status === 'fulfilled') gInfo = [gRes.value.data];
          if (pRes.status === 'fulfilled') prog = pRes.value.data?.['phanTramTienDo'] || 0;
        }

        setStats((prev) => {
          return ({
            ...prev,
            myGroups: gInfo,
            groupProgress: Number(prog),
            studentTasks: {
              todo: tasks.filter(t => t['trangThai'] === 'TODO').length,
              doing: tasks.filter(t => t['trangThai'] === 'IN_PROGRESS').length,
              done: tasks.filter(t => t['trangThai'] === 'DONE').length
            }
          });
        });
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Sửa lỗi "Promise returned is ignored" bằng cách gán vào một biến hoặc dùng .catch()
    const loadData = async () => {
      await fetchDashboardData();
    };
    loadData().catch(console.error);
  }, [fetchDashboardData]);

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  const currentRole = user?.role?.toUpperCase();

  return (
      <div className="p-6">
        <div className="flex justify-between mb-8">
          <h2 className="text-2xl font-bold">Chào {user?.hoTen}!</h2>
          <button onClick={() => navigate('/settings')} className="btn btn-ghost"><Settings size={20}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {currentRole === 'ADMIN' && (
              <div className="glass-card p-4 flex items-center gap-4 border border-base-300 rounded-xl">
                <Users className="text-blue-500" />
                <span>Người dùng: <b>{stats.totalUsers}</b></span>
              </div>
          )}
          <div className="glass-card p-4 flex items-center gap-4 border border-base-300 rounded-xl">
            <LayoutGrid className="text-purple-500" />
            <span>Nhóm: <b>{currentRole === 'ADMIN' ? stats.totalGroups : stats.myGroups.length}</b></span>
          </div>
          {currentRole === 'SINH_VIEN' && (
              <div className="glass-card p-4 flex items-center gap-4 border border-base-300 rounded-xl">
                <Activity className="text-green-500" />
                <span>Tiến độ: <b>{stats.groupProgress}%</b></span>
              </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 border border-base-300 rounded-2xl">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-lg"><Zap size={18} className="text-yellow-500"/> Hoạt động nhanh</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300" onClick={() => navigate('/tasks')}>
                <CheckSquare size={18} /> Xem nhiệm vụ <Clock size={14} className="ml-auto opacity-50"/>
              </div>
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300" onClick={() => navigate('/reports')}>
                <FileText size={18} /> Xuất báo cáo <ArrowRight size={14} className="ml-auto opacity-50"/>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-base-300 rounded-2xl">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><Trophy size={18} className="text-orange-500"/> Xếp hạng</h3>
            {stats.topPerformers.length > 0 ? (
                stats.topPerformers.map((p, idx) => (
                    <div key={idx} className="flex flex-col mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{p.name}</span>
                        <span className="font-bold">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-400 h-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                ))
            ) : (
                <p className="text-sm opacity-50 italic">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;