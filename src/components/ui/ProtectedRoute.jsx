import { useEffect, useState } from 'react'
import { Navigate }            from 'react-router-dom'
import { onAuthStateChanged }  from 'firebase/auth'
import { auth }                from '../../config/firebase'
import Loader                  from './Loader'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState(() => {
    // Check immediately — agar already logged in hai toh loader skip karo
    return auth.currentUser ? 'auth' : 'checking'
  })

  useEffect(() => {
    // Agar already auth hai toh subscribe karne ki zaroorat nahi
    if (status === 'auth') return

    const unsub = onAuthStateChanged(auth, user => {
      setStatus(user ? 'auth' : 'unauth')
    })
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'checking') return <Loader fullscreen text="Verifying session…" />
  if (status === 'unauth')   return <Navigate to="/admin-login" replace />
  return children
}