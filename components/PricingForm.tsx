'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PricingForm() {
  const [formData, setFormData] = useState({
    name: '',
    date_created: '',
    date_listed: '',
    material_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    glazing_quality: 5,
    originality: 5,
    beauty: 5,
    demand: 5,
    alpha: 0.5,
    beta: 0.5,
    hours_worked: 0,
    markup: 0.3
  })

  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Ceramic Price Predictor</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Name</label>
              <input
                type="text"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Date Created</label>
              <input
                type="date"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.date_created}
                onChange={(e) => setFormData({...formData, date_created: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Date Listed</label>
              <input
                type="date"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.date_listed}
                onChange={(e) => setFormData({...formData, date_listed: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Hours Worked</label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.hours_worked}
                onChange={(e) => setFormData({...formData, hours_worked: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Costs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Material Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.material_cost}
                onChange={(e) => setFormData({...formData, material_cost: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Labor Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.labor_cost}
                onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Overhead Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border rounded px-3 py-2 text-gray-900"
                value={formData.overhead_cost}
                onChange={(e) => setFormData({...formData, overhead_cost: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        </div>

        {/* Quality Sliders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quality Attributes (1-10)</h2>
          
          <div className="space-y-4">
            {['glazing_quality', 'originality', 'beauty', 'demand'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2 capitalize text-gray-900">
                  {field.replace('_', ' ')}: {formData[field as keyof typeof formData]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full"
                  value={formData[field as keyof typeof formData] as number}
                  onChange={(e) => setFormData({...formData, [field]: parseInt(e.target.value)})}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Weights */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Pricing Weights</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Alpha (Cost Weight): {formData.alpha.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="w-full"
                value={formData.alpha}
                onChange={(e) => setFormData({...formData, alpha: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Beta (Quality Weight): {formData.beta.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="w-full"
                value={formData.beta}
                onChange={(e) => setFormData({...formData, beta: parseFloat(e.target.value)})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Markup: {(formData.markup * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                className="w-full"
                value={formData.markup}
                onChange={(e) => setFormData({...formData, markup: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Calculating...' : 'Get Price Prediction'}
        </button>
      </form>

      {/* Results */}
      {prediction && (
        <div className="mt-8 bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="text-2xl font-bold mb-4">Predicted Price</h2>
          <p className="text-4xl font-bold text-green-600 mb-4">
            ${prediction.predicted_price}
          </p>
          
          <div className="space-y-2 text-sm">
            <p><strong>Confidence Range:</strong> ${prediction.confidence_interval[0]} - ${prediction.confidence_interval[1]}</p>
            <p><strong>Total Cost:</strong> ${prediction.breakdown.total_cost}</p>
            <p><strong>Base Price:</strong> ${prediction.breakdown.base_price.toFixed(2)}</p>
            <p><strong>Quality Adjustment:</strong> ${prediction.breakdown.quality_adjustment.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  )
}