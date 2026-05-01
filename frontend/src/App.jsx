import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import AdminUsers from './pages/AdminUsers';
import AdminGroups from './pages/AdminGroups';
import AdminConfig from './pages/AdminConfig';

import TeacherClasses from './pages/TeacherClasses';
import TeacherReports from './pages/TeacherReports';
import SprintProgress from './pages/SprintProgress';
import ContributionTracking from './pages/ContributionTracking';

import MemberTasks from './pages/MemberTasks';
import MemberCommits from './pages/MemberCommits';
import LeaderTasks from './pages/LeaderTasks';
import ReportGenerator from './pages/ReportGenerator';
import PersonalProfile from './pages/PersonalProfile';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
      <Router>
        <UIProvider>
          <AuthProvider>
            <Routes>
              {/* Các route không nằm trong Layout (như Login, Forgot Password) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Các route nằm trong Layout chung của hệ thống */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Admin Routes */}
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/groups" element={<AdminGroups />} />
                <Route path="/admin/config" element={<AdminConfig />} />

                {/* Teacher Routes */}
                <Route path="/teacher/classes" element={<TeacherClasses />} />
                <Route path="/teacher/reports" element={<TeacherReports />} />

                {/* Member & Leader Routes */}
                <Route path="/member/tasks" element={<MemberTasks />} />
                <Route path="/member/commits" element={<MemberCommits />} />
                <Route path="/leader/tasks" element={<LeaderTasks />} />

                <Route path="/project/sprint" element={<SprintProgress />} />
                <Route path="/project/heatmap" element={<ContributionTracking />} />

                <Route path="/reports/generate" element={<ReportGenerator />} />
                <Route path="/profile" element={<PersonalProfile />} />

                {/* Mặc định quay về Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </AuthProvider>
        </UIProvider>
      </Router>
  );
}

export default App;