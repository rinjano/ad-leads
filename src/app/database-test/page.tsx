'use client'

import { useState, useEffect } from 'react'
import { leadsService, activitiesService, adsSpendService, dashboardService } from '../../lib/database'

export default function DatabaseTest() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testResults, setTestResults] = useState([])

  const addTestResult = (test, success, data = null, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testLeadsOperations = async () => {
    setLoading(true)
    try {
      // Test 1: Get all leads
      const allLeads = await leadsService.getAll()
      addTestResult('Get All Leads', true, `Found ${allLeads.length} leads`)
      setLeads(allLeads)

      // Test 2: Create new lead
      const newLead = {
        name: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        phone: '+6281234567890',
        company: 'Test Company',
        position: 'Test Position',
        source: 'test',
        status: 'new',
        notes: 'Created from database test'
      }
      
      const createdLead = await leadsService.create(newLead)
      addTestResult('Create Lead', true, `Created lead: ${createdLead.name}`)

      // Test 3: Update lead
      const updatedLead = await leadsService.update(createdLead.id, {
        status: 'contacted',
        notes: 'Updated from test'
      })
      addTestResult('Update Lead', true, `Updated lead status to: ${updatedLead.status}`)

      // Test 4: Search leads
      const searchResults = await leadsService.search('test')
      addTestResult('Search Leads', true, `Found ${searchResults.length} leads with "test"`)

      // Test 5: Delete test lead
      await leadsService.delete(createdLead.id)
      addTestResult('Delete Lead', true, 'Test lead deleted successfully')

      // Refresh leads list
      const refreshedLeads = await leadsService.getAll()
      setLeads(refreshedLeads)

    } catch (err) {
      console.error('Test error:', err)
      addTestResult('Leads Operations', false, null, err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDashboardStats = async () => {
    try {
      const dashboardStats = await dashboardService.getStats()
      addTestResult('Dashboard Stats', true, JSON.stringify(dashboardStats, null, 2))
      setStats(dashboardStats)
    } catch (err) {
      addTestResult('Dashboard Stats', false, null, err.message)
    }
  }

  const testAdsSpend = async () => {
    try {
      const adsData = await adsSpendService.getAll()
      addTestResult('Ads Spend Data', true, `Found ${adsData.length} ads records`)
      
      const summary = await adsSpendService.getSummary()
      addTestResult('Ads Summary', true, `Total Spend: ${summary.totalSpend}, Total Leads: ${summary.totalLeads}`)
    } catch (err) {
      addTestResult('Ads Spend', false, null, err.message)
    }
  }

  const runAllTests = async () => {
    setTestResults([])
    setError(null)
    
    await testLeadsOperations()
    await testDashboardStats()
    await testAdsSpend()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Database Operations Test
          </h1>
          
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg mb-4"
          >
            {loading ? 'Running Tests...' : 'Run All Database Tests'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅' : '❌'} {result.test}
                    </span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  {result.data && (
                    <p className={`text-sm mt-1 ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.data}
                    </p>
                  )}
                  {result.error && (
                    <p className="text-sm mt-1 text-red-600">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Leads */}
        {leads.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Leads ({leads.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.slice(0, 10).map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{lead.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{lead.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{lead.company}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                          lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{lead.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-600 text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalLeads}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-sm font-medium">New Leads</p>
                <p className="text-2xl font-bold text-green-900">{stats.newLeads}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-600 text-sm font-medium">Qualified</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.qualifiedLeads}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-600 text-sm font-medium">Converted</p>
                <p className="text-2xl font-bold text-purple-900">{stats.convertedLeads}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}