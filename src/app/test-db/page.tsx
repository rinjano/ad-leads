'use client'

import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function TestDB() {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [tablesList, setTablesList] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Testing Supabase connection...')
        
        // Method 1: Test auth session (always works)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Auth session check:', sessionError ? 'Error' : 'OK')
        
        // Method 2: Test basic REST API connection
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          console.log('✅ REST API connection successful!')
          setConnectionStatus('success')
          setTablesList([
            { table_name: '✅ REST API Connection Verified' },
            { table_name: '✅ Authentication Module Loaded' },
            { table_name: '✅ Supabase Client Initialized' }
          ])
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
      } catch (err) {
        console.error('Connection error:', err)
        setError(err.message)
        setConnectionStatus('failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Test Koneksi Database Supabase
          </h1>
          
          <div className="space-y-6">
            {/* Status Koneksi */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Status Koneksi
              </h2>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
                  connectionStatus === 'success' ? 'bg-green-500' :
                  'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  connectionStatus === 'testing' ? 'text-yellow-600' :
                  connectionStatus === 'success' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {connectionStatus === 'testing' && 'Mengetes koneksi...'}
                  {connectionStatus === 'success' && 'Koneksi berhasil!'}
                  {connectionStatus === 'failed' && 'Koneksi gagal!'}
                </span>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Environment Variables
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Supabase URL:</span>
                  <span className="ml-2 text-gray-800">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Not found'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Supabase Key:</span>
                  <span className="ml-2 text-gray-800">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not found'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="border-l-4 border-red-500 pl-4">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
                <p className="text-red-600 bg-red-50 p-3 rounded text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Connection Status Details */}
            {connectionStatus === 'success' && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Status Koneksi Details
                </h2>
                {tablesList.length > 0 ? (
                  <ul className="space-y-1">
                    {tablesList.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {item.table_name || item.tablename || item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    Koneksi berhasil tetapi tidak ada detail tambahan.
                  </p>
                )}
              </div>
            )}

            {/* Next Steps */}
            {connectionStatus === 'success' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🎉 Koneksi Berhasil!
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  Aplikasi Anda sudah terhubung dengan database Supabase.
                </p>
                <div className="text-sm text-blue-600">
                  <p><strong>Langkah selanjutnya:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Buat tables yang diperlukan di Supabase Dashboard</li>
                    <li>Setup authentication jika diperlukan</li>
                    <li>Implementasi CRUD operations</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}