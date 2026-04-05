import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence }  from 'framer-motion'
import { ToastProvider }    from './components/ui/Toast'
import ErrorBoundary        from './components/ui/ErrorBoundary'
import NotFound             from './components/ui/NotFound'
import Home                 from './pages/Home'
import Apply                from './pages/Apply'
import Success              from './pages/Success'
import AdminLogin           from './pages/AdminLogin'
import AdminDashboard       from './pages/AdminDashboard'
import AdminManage          from './pages/AdminManage'       // NEW
import PrivacyPolicy        from './pages/PrivacyPolicy'
import TermsOfService       from './pages/TermsOfService'

const ProtectedRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('vc_admin') === 'true'
  return isAdmin ? children : <Navigate to="/admin-login" replace />
}

export default function App() {
  const location = useLocation()
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<Home />}           />
            <Route path="/apply"         element={<Apply />}          />
            <Route path="/success"       element={<Success />}        />
            <Route path="/admin-login"   element={<AdminLogin />}     />
            <Route path="/privacy"       element={<PrivacyPolicy />}  />
            <Route path="/terms"         element={<TermsOfService />} />

            {/* Protected admin routes */}
            <Route path="/admin"
              element={
                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
              }
            />
            <Route path="/admin/manage"
              element={
                <ProtectedRoute><AdminManage /></ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </ToastProvider>
    </ErrorBoundary>
  )
}