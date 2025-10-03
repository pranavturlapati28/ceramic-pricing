'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CeramicItem {
  id: string
  name: string
  date_created: string
  date_listed: string
  date_sold?: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  glazing_quality: number
  originality: number
  beauty: number
  demand: number
  hours_worked: number
  predicted_price?: number
  actual_price?: number
  status: string
  profit?: number
  profit_margin?: number
  days_to_sell?: number
  created_at: string
}

interface Stats {
  total_items: number
  sold_items: number
  listed_items: number
  price_stats?: {
    min: number
    max: number
    average: number
    total_revenue: number
  }
  ready_for_training: boolean
}

export default function HistoryPage() {
  const [items, setItems] = useState<CeramicItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sold' | 'listed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      // Fetch all items
      const itemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const itemsData = await itemsResponse.json()
      setItems(itemsData.items || [])

      // Fetch statistics
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const statsData = await statsResponse.json()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items
    .filter(item => {
      if (filter === 'all') return true
      return item.status === filter
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'price') {
        const priceA = a.actual_price || a.predicted_price || 0
        const priceB = b.actual_price || b.predicted_price || 0
        return priceB - priceA
      } else {
        return a.name.localeCompare(b.name)
      }
    })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History & Analytics</h1>
        <p className="text-gray-600">Track your ceramics and view insights</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_items}</div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">Sold Items</div>
            <div className="text-3xl font-bold text-green-600">{stats.sold_items}</div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Listed Items</div>
            <div className="text-3xl font-bold text-blue-600">{stats.listed_items}</div>
          </div>

          {stats.price_stats && (
            <div className="bg-purple-50 p-6 rounded-lg shadow border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-purple-600">
                ${stats.price_stats.total_revenue.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Average Price Info */}
      {stats?.price_stats && stats.sold_items > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow border-2 border-blue-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Average Price</div>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.price_stats.average.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Lowest Price</div>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.price_stats.min.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Highest Price</div>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.price_stats.max.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Readiness Alert */}
      {stats && (
        <div className={`p-4 rounded-lg mb-8 border-2 ${
          stats.ready_for_training 
            ? 'bg-green-50 border-green-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {stats.ready_for_training ? '✅' : '⚠️'}
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                {stats.ready_for_training 
                  ? 'Ready for ML Training!' 
                  : `Need more data (${stats.sold_items}/20 historical sales)`}
              </p>
              <p className="text-sm text-gray-600">
                {stats.ready_for_training
                  ? 'You have enough historical data to train an accurate pricing model.'
                  : `Add ${20 - stats.sold_items} more historical sales to unlock AI-powered predictions.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border-2 border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('sold')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'sold'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sold ({items.filter(i => i.status === 'sold').length})
            </button>
            <button
              onClick={() => setFilter('listed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'listed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Listed ({items.filter(i => i.status === 'listed').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center border-2 border-gray-200">
          <p className="text-xl text-gray-600 mb-4">No items found</p>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Start by adding a historical sale or creating a price prediction.'
              : `No ${filter} items yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Item Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'sold'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-1 text-gray-900 font-medium">
                        {new Date(item.date_created).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Listed:</span>
                      <span className="ml-1 text-gray-900 font-medium">
                        {new Date(item.date_listed).toLocaleDateString()}
                      </span>
                    </div>
                    {item.date_sold && (
                      <div>
                        <span className="text-gray-600">Sold:</span>
                        <span className="ml-1 text-gray-900 font-medium">
                          {new Date(item.date_sold).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {item.days_to_sell !== undefined && (
                      <div>
                        <span className="text-gray-600">Days to Sell:</span>
                        <span className="ml-1 text-gray-900 font-medium">
                          {item.days_to_sell}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      Quality: {item.glazing_quality}/10
                    </span>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      Originality: {item.originality}/10
                    </span>
                    <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                      Beauty: {item.beauty}/10
                    </span>
                    <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                      Demand: {item.demand}/10
                    </span>
                  </div>
                </div>

                {/* Right: Price Info */}
                <div className="border-l-0 md:border-l-2 md:pl-6 border-gray-200">
                  {item.actual_price ? (
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Sale Price</div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${item.actual_price.toFixed(2)}
                      </div>
                      {item.profit !== undefined && (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">Profit: </span>
                            <span className={`font-semibold ${
                              item.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${item.profit.toFixed(2)}
                            </span>
                          </div>
                          {item.profit_margin !== undefined && (
                            <div className="text-sm">
                              <span className="text-gray-600">Margin: </span>
                              <span className={`font-semibold ${
                                item.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.profit_margin.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : item.predicted_price ? (
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Predicted Price</div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${item.predicted_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Awaiting sale
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-3 text-right">
                    <div className="text-xs text-gray-600">Total Cost</div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.material_cost + item.labor_cost + item.overhead_cost).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}