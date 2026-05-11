#!/usr/bin/env bash

set -e

APP_NAME="HAYEE_UK_FYP_WEB"

echo "Creating Vite React app..."
npm create vite@latest "$APP_NAME" -- --template react

cd "$APP_NAME"

echo "Installing base dependencies..."
npm install

echo "Installing Tailwind CSS v4 for Vite..."
npm install tailwindcss @tailwindcss/vite

echo "Updating vite.config.js..."
cat > vite.config.js <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
EOF

echo "Updating src/index.css..."
cat > src/index.css <<'EOF'
@import "tailwindcss";
EOF

echo "Creating folder structure..."
mkdir -p \
src/app/store \
src/app/router \
src/app/providers \
src/assets/images \
src/assets/icons \
src/assets/styles \
src/components/common \
src/components/layout \
src/components/charts \
src/features/auth/api \
src/features/auth/components \
src/features/auth/hooks \
src/features/auth/pages \
src/features/auth/store \
src/features/auth/types \
src/features/auth/utils \
src/features/dashboard/api \
src/features/dashboard/components \
src/features/dashboard/hooks \
src/features/dashboard/pages \
src/features/dashboard/types \
src/features/users/api \
src/features/users/components \
src/features/users/hooks \
src/features/users/pages \
src/features/users/types \
src/features/videos/api \
src/features/videos/components \
src/features/videos/hooks \
src/features/videos/pages \
src/features/videos/types \
src/features/analysis/api \
src/features/analysis/components \
src/features/analysis/hooks \
src/features/analysis/pages \
src/features/analysis/types \
src/features/reports/api \
src/features/reports/components \
src/features/reports/hooks \
src/features/reports/pages \
src/features/reports/types \
src/features/consent/api \
src/features/consent/components \
src/features/consent/hooks \
src/features/consent/pages \
src/features/consent/types \
src/lib \
src/hooks \
src/types \
src/styles

echo "Creating files..."
touch \
src/app/store/index.js \
src/app/store/hooks.js \
src/app/router/index.jsx \
src/app/router/ProtectedRoute.jsx \
src/app/router/routePaths.js \
src/app/providers/QueryProvider.jsx \
src/app/providers/ThemeProvider.jsx \
src/app/providers/AppProvider.jsx \
src/components/common/Button.jsx \
src/components/common/Input.jsx \
src/components/common/Modal.jsx \
src/components/common/Loader.jsx \
src/components/common/EmptyState.jsx \
src/components/common/ErrorState.jsx \
src/components/common/PageHeader.jsx \
src/components/layout/MainLayout.jsx \
src/components/layout/Sidebar.jsx \
src/components/layout/Header.jsx \
src/components/layout/Footer.jsx \
src/components/charts/FeatureBarChart.jsx \
src/components/charts/TrendChart.jsx \
src/components/charts/ScoreDonutChart.jsx \
src/features/auth/api/authApi.js \
src/features/auth/components/LoginForm.jsx \
src/features/auth/components/RegisterForm.jsx \
src/features/auth/hooks/useLogin.js \
src/features/auth/hooks/useRegister.js \
src/features/auth/pages/LoginPage.jsx \
src/features/auth/pages/RegisterPage.jsx \
src/features/auth/store/authSlice.js \
src/features/auth/types/authTypes.js \
src/features/auth/utils/authHelpers.js \
src/features/dashboard/api/dashboardApi.js \
src/features/dashboard/components/SummaryCards.jsx \
src/features/dashboard/components/RecentJobsTable.jsx \
src/features/dashboard/components/ProcessingStats.jsx \
src/features/dashboard/hooks/useDashboard.js \
src/features/dashboard/pages/DashboardPage.jsx \
src/features/dashboard/types/dashboardTypes.js \
src/features/users/api/usersApi.js \
src/features/users/components/UsersTable.jsx \
src/features/users/components/UserDetailsDrawer.jsx \
src/features/users/hooks/useUsers.js \
src/features/users/pages/UsersPage.jsx \
src/features/users/types/userTypes.js \
src/features/videos/api/videosApi.js \
src/features/videos/components/VideoUploadForm.jsx \
src/features/videos/components/VideoPreviewCard.jsx \
src/features/videos/components/VideosTable.jsx \
src/features/videos/hooks/useUploadVideo.js \
src/features/videos/hooks/useVideos.js \
src/features/videos/pages/UploadVideoPage.jsx \
src/features/videos/pages/VideosPage.jsx \
src/features/videos/types/videoTypes.js \
src/features/analysis/api/analysisApi.js \
src/features/analysis/components/AnalysisStatusBadge.jsx \
src/features/analysis/components/AnalysisResultPanel.jsx \
src/features/analysis/components/FeatureSummaryPanel.jsx \
src/features/analysis/components/AnalysisJobsTable.jsx \
src/features/analysis/hooks/useAnalysisJobs.js \
src/features/analysis/hooks/useAnalysisStatus.js \
src/features/analysis/hooks/useAnalysisResult.js \
src/features/analysis/pages/AnalysisJobsPage.jsx \
src/features/analysis/pages/AnalysisResultPage.jsx \
src/features/analysis/types/analysisTypes.js \
src/features/reports/api/reportsApi.js \
src/features/reports/components/ReportsTable.jsx \
src/features/reports/components/ExportReportButton.jsx \
src/features/reports/hooks/useReports.js \
src/features/reports/pages/ReportsPage.jsx \
src/features/reports/types/reportTypes.js \
src/features/consent/api/consentApi.js \
src/features/consent/components/ConsentDetailsCard.jsx \
src/features/consent/hooks/useConsent.js \
src/features/consent/pages/ConsentPage.jsx \
src/features/consent/types/consentTypes.js \
src/lib/axios.js \
src/lib/queryClient.js \
src/lib/utils.js \
src/lib/validators.js \
src/lib/formatters.js \
src/hooks/useDebounce.js \
src/hooks/usePagination.js \
src/hooks/useDisclosure.js \
src/types/api.js \
src/types/common.js \
src/types/index.js \
src/styles/globals.css \
src/styles/theme.css \
.env.example

echo "Replacing starter App.jsx..."
cat > src/App.jsx <<'EOF'
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900">
        HAYEE UK FYP WEB
      </h1>
    </div>
  )
}

export default App
EOF

echo "Setup complete."
echo ""
echo "Next steps:"
echo "cd $APP_NAME"
echo "npm run dev"