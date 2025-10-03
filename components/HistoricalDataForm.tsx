'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HistoricalDataForm() {
  const [formData, setFormData] = useState({
    name: '',
    date_created: '',
    date_listed: '',
    date_sold: '',
    material_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    glazing_quality: 5,
    originality: 5,
    beauty: 5,
    demand: 5,
    hours_worked: 0,
    actual_price: 0, // The price it actually sold for
    notes: ''
  })

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus('idle')

    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/historical`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save historical data')
      }

      setSubmitStatus('success')
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          date_created: '',
          date_listed: '',
          date_sold: '',
          material_cost: 0,
          labor_cost: 0,
          overhead_cost: 0,
          glazing_quality: 5,
          originality: 5,
          beauty: 5,
          demand: 5,
          hours_worked: 0,
          actual_price: 0,
          notes: ''
        })
        setSubmitStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    } finally {
      setLoading(false)
    }
  }

  // Calculate days to sell
  const daysToSell = formData.date_listed && formData.date_sold 
    ? Math.floor((new Date(formData.date_sold).getTime() - new Date(formData.date_listed).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const totalCost = formData.material_cost + formData.labor_cost + formData.overhead_cost
  const profit = formData.actual_price - totalCost
  const profitMargin = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Historical Sale</h1>
        <p className="text-gray-600">Log past sales to improve price predictions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Item Name *
              </label>
              <input
                type="text"
                required
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Blue Glazed Vase"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Date Created *
              </label>
              <input
                type="date"
                required
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                value={formData.date_created}
                onChange={(e) => setFormData({...formData, date_created: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Date Listed *
              </label>
              <input
                type="date"
                required
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                value={formData.date_listed}
                onChange={(e) => setFormData({...formData, date_listed: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Date Sold *
              </label>
              <input
                type="date"
                required
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                value={formData.date_sold}
                onChange={(e) => setFormData({...formData, date_sold: e.target.value})}
              />
              {daysToSell !== null && daysToSell >= 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Sold in {daysToSell} days
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Hours Worked *
              </label>
              <input
                type="number"
                step="0.5"
                required
                min="0"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="0"
                value={formData.hours_worked || ''}
                onChange={(e) => setFormData({...formData, hours_worked: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Production Costs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Material Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                value={formData.material_cost || ''}
                onChange={(e) => setFormData({...formData, material_cost: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Labor Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                value={formData.labor_cost || ''}
                onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Overhead Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                value={formData.overhead_cost || ''}
                onChange={(e) => setFormData({...formData, overhead_cost: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Total Cost:</span>
              <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quality Sliders */}
        <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quality Attributes (1-10)</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Glazing Quality: <span className="font-bold text-blue-600">{formData.glazing_quality}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={formData.glazing_quality}
                onChange={(e) => setFormData({...formData, glazing_quality: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Originality: <span className="font-bold text-blue-600">{formData.originality}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={formData.originality}
                onChange={(e) => setFormData({...formData, originality: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Common</span>
                <span>Unique</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Beauty: <span className="font-bold text-blue-600">{formData.beauty}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={formData.beauty}
                onChange={(e) => setFormData({...formData, beauty: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Plain</span>
                <span>Stunning</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Demand: <span className="font-bold text-blue-600">{formData.demand}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={formData.demand}
                onChange={(e) => setFormData({...formData, demand: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sale Price */}
        <div className="bg-blue-50 p-6 rounded-lg shadow border-2 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Sale Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Actual Sale Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full border-2 border-blue-300 rounded px-3 py-2 text-gray-900 text-xl font-semibold focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                value={formData.actual_price || ''}
                onChange={(e) => setFormData({...formData, actual_price: parseFloat(e.target.value) || 0})}
              />
            </div>

            {formData.actual_price > 0 && (
              <div className="space-y-2 p-4 bg-white rounded border border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Profit:</span>
                  <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Profit Margin:</span>
                  <span className={`font-bold ${parseFloat(profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin}%
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Notes (optional)
              </label>
              <textarea
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Any additional context about this sale..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-lg"
        >
          {loading ? 'Saving...' : 'Save Historical Sale'}
        </button>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="text-green-800 font-semibold text-center">
              ✓ Historical sale saved successfully!
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
            <p className="text-red-800 font-semibold text-center">
              ✗ Failed to save. Please try again.
            </p>
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Why log historical sales?</h3>
        <p className="text-sm text-gray-700">
          Each sale you log helps train the pricing model. The more historical data you provide, 
          the better the AI can predict prices for future pieces. Aim for at least 20-30 past sales 
          for accurate predictions.
        </p>
      </div>
    </div>
  )
}