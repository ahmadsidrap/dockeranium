'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Network {
  id: string
  name: string
  driver: string
  scope: string
  containers: number
}

type TabType = 'all' | 'running' | 'exited'

export default function NetworksPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('running')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchNetworks()
  }, [])

  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/networks/`)
      if (!response.ok) throw new Error('Failed to fetch networks')
      const data = await response.json()
      setNetworks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch networks')
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (networkId: string) => {
    router.push(`/networks/${networkId}`)
  }

  const handleDelete = async (e: React.MouseEvent, networkId: string) => {
    e.stopPropagation() // Prevent row click from triggering
    
    if (!confirm('Are you sure you want to delete this network?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/networks/${networkId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete network')
      
      // Refresh the networks list
      fetchNetworks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete network')
    }
  }

  const filteredNetworks = networks.filter(network => {
    const matchesSearch = network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         network.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    const isSpecialNetwork = ['host', 'none', 'bridge'].includes(network.name)
    if (isSpecialNetwork) return false
    
    if (activeTab === 'all') return true
    if (activeTab === 'running') return network.containers > 0

    return network.containers === 0 // exited
  })

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold mb-4">Networks</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {(['all', 'running', 'exited'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-1 max-w-sm ml-4">
              <input
                type="text"
                placeholder="Search networks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">Loading networks...</div>
        )}

        {error && (
          <div className="text-red-500 px-6 py-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Driver</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Scope</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Containers</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredNetworks.map((network) => (
                    <tr 
                      key={network.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(network.id)}
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="text-blue-600 hover:text-blue-800 hover:underline">
                          {network.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{network.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{network.driver}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{network.scope}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{network.containers}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={(e) => handleDelete(e, network.id)}
                          disabled={network.containers > 0}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredNetworks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No networks found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 