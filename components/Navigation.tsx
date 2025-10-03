'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }
  
  const navItems = [
    { name: 'Predict Price', path: '/' },
    { name: 'Add Historical Sale', path: '/historical' },
    { name: 'View History', path: '/history' },
  ]
  
  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">🏺 Ceramic Pricer</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}

            <div className="border-l border-gray-700 pl-4 ml-4 flex items-center space-x-3">
              {userEmail && (
                <span className="text-gray-300 text-sm hidden md:block">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}