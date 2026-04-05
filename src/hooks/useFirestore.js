import { useState, useEffect, useCallback } from 'react'

/**
 * Generic hook to fetch Firestore data with loading + error states
 * Usage: const { data, loading, error, refetch } = useFirestore(fetchFn)
 */
export function useFirestore(fetchFn, deps = []) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (e) {
      setError(e.message || 'Failed to load data.')
      console.error('[useFirestore]', e)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}