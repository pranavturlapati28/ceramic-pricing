import HistoryPage from '@/components/HistoryPage'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function History() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <HistoryPage />
      </main>
    </ProtectedRoute>
  )
}