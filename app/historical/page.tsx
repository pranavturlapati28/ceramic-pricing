import HistoricalDataForm from '@/components/HistoricalDataForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function HistoricalPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <HistoricalDataForm />
      </main>
    </ProtectedRoute>
  )
}