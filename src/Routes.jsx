import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import { RequireAuth, GuestRoute } from './features/auth/index.js'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import NotFoundPage from './pages/errors/NotFoundPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import UploadPage from './pages/upload/UploadPage.jsx'
import AnalyzeVideoHfPage from './pages/analysis/AnalyzeVideoHfPage.jsx'
import AnalyzeAudioPage from './pages/analysis/AnalyzeAudioPage.jsx'
import MultimodalPredictPage from './pages/analysis/MultimodalPredictPage.jsx'
import VideosPage from './pages/videos/VideosPage.jsx'
import AnalysisJobsPage from './pages/jobs/AnalysisJobsPage.jsx'
import AnalysisResultPage from './pages/results/AnalysisResultPage.jsx'
import ReportsPage from './pages/reports/ReportsPage.jsx'
import ConsentPage from './pages/consent/ConsentPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'
import HealthPage from './pages/health/HealthPage.jsx'

/** All app routes under MainLayout require a valid session (Redux token). */
function ProtectedLayout() {
  return (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/analyze-video-hf" element={<AnalyzeVideoHfPage />} />
        <Route path="/analyze-audio" element={<AnalyzeAudioPage />} />
        <Route path="/multimodal-predict" element={<MultimodalPredictPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/jobs" element={<AnalysisJobsPage />} />
        <Route path="/analysis/:jobId" element={<AnalysisResultPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/health" element={<HealthPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
