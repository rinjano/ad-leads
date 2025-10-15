'use client'

import { supabase } from '../../lib/supabase'
import { useState } from 'react'

export default function SimpleTest() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testBasicConnection = async () => {
    setLoading(true)
    setTestResult('Testing...')
    
    try {
      // Test 1: Check if client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      
      // Test 2: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error('Environment variables not found')
      }
      
      // Test 3: Try to get auth session
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`Auth Error: ${error.message}`)
      } else {
        setTestResult('✅ Connection successful! Supabase client is working properly.')
      }
      
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Supabase Test</h1>
        
        <button 
          onClick={testBasicConnection}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg mb-4"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {testResult && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
        </div>
      </div>
    </div>
  )
}