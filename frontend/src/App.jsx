import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth.jsx'
import HomePage from './pages/home.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import DashboardHome from './pages/DashboardHome.jsx'
import Onboarding from './pages/Onboarding.jsx'
import JobHistory from './pages/JobHistory.jsx'
import ExitWorkflow from './pages/ExitWorkflow.jsx'
import Compliance from './pages/Compliance.jsx'
import Reports from './pages/Reports.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/home"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="job-history" element={<JobHistory />} />
        <Route path="exit-workflow" element={<ExitWorkflow />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
