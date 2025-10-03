'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        // Auto-login after signup
        const { error: signInError } = await signIn(email, password)
        if (signInError) throw signInError
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-gray-200">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏺</div>
            <h1 className="text-3xl font-bold text-gray-900">Ceramic Pricer</h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </button>
          </div>

          {/* Demo Info */}
          {!isLogin && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Note:</strong> Your data is private and only you can see it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}