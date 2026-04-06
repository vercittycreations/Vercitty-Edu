import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
import NotFound from './components/ui/NotFound'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Home           from './pages/Home'
import Apply          from './pages/Apply'
import Success        from './pages/Success'
import AdminLogin     from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminManage    from './pages/AdminManage'
import PrivacyPolicy  from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import StudentLookup  from './pages/StudentLookup'

import { trackPageView } from './services/analyticsService'

function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    const names = {
      '/':               'Home',
      '/apply':          'Apply',
      '/success':        'Success',
      '/admin-login':    'Admin Login',
      '/admin':          'Admin Dashboard',
      '/admin/manage':   'Admin Manage',
      '/student-lookup': 'Student Lookup',
      '/privacy':        'Privacy Policy',
      '/terms':          'Terms of Service',
    }
    trackPageView(names[location.pathname] || location.pathname, window.location.href)
  }, [location.pathname])
  return null
}

export default function App() {
  const location = useLocation()
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AnalyticsTracker />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"               element={<Home />} />
            <Route path="/apply"          element={<Apply />} />
            <Route path="/success"        element={<Success />} />
            <Route path="/admin-login"    element={<AdminLogin />} />
            <Route path="/privacy"        element={<PrivacyPolicy />} />
            <Route path="/terms"          element={<TermsOfService />} />
            <Route path="/student-lookup" element={<StudentLookup />} />

            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/manage" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </ToastProvider>
    </ErrorBoundary>
  )
}