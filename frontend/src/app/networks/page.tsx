'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Network {
  id: string
  name: string
  driver: string
  scope: string
  ipam: Array<{
    Subnet?: string | undefined
    Gateway?: string | undefined
  }> | null
  internal: boolean
  inUse: boolean
  containers: number
}

export default function NetworksPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [networksToDelete, setNetworksToDelete] = useState<Network[]>([])

  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/networks`)
      if (!response.ok) throw new Error('Failed to fetch networks')
      const data = await response.json()
      
      const filteredNetworks = data.filter((network: Network) => {
        const isSpecialNetwork = ['host', 'none'].includes(network.name)
        const hasNetworkConfig = network.ipam && Array.isArray(network.ipam) && 
          network.ipam.some(config => config && (config.Subnet || config.Gateway))
        return !isSpecialNetwork && hasNetworkConfig
      })
      setNetworks(filteredNetworks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch networks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNetworks()
  }, [])

  const filteredNetworks = networks.filter(network => {
    const searchLower = searchTerm.toLowerCase()
    return network.name.toLowerCase().includes(searchLower) ||
           network.id.toLowerCase().includes(searchLower) ||
           network.driver.toLowerCase().includes(searchLower)
  })

  const handleSelectNetwork = (networkId: string) => {
    const newSelected = new Set(selectedNetworks)
    if (newSelected.has(networkId)) {
      newSelected.delete(networkId)
    } else {
      newSelected.add(networkId)
    }
    setSelectedNetworks(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedNetworks.size === filteredNetworks.length) {
      setSelectedNetworks(new Set())
    } else {
      setSelectedNetworks(new Set(filteredNetworks.map(net => net.id)))
    }
  }

  const handleBulkDeleteClick = () => {
    const networksToDelete = filteredNetworks.filter(net => 
      selectedNetworks.has(net.id) && !net.inUse
    )
    setNetworksToDelete(networksToDelete)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true)
      
      // Delete networks sequentially
      for (const network of networksToDelete) {
        const response = await fetch(`${API_URL}/api/networks/${network.id}/`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to delete network ${network.name}`)
        }
      }
      
      await fetchNetworks()
      setSelectedNetworks(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete networks')
    } finally {
      setBulkDeleteLoading(false)
      setNetworksToDelete([])
    }
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Networks</h2>
        </div>

        {/* Add loading state */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading networks...</p>
          </div>
        )}

        {/* Add error state */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Search Input */}
        {!loading && !error && (
          <>
            <div className="px-6 pt-4">
              <div className="max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Networks
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or driver..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {networksToDelete.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete these {networksToDelete.length} networks?
                  </p>
                  <div className="max-h-40 overflow-y-auto mb-6">
                    {networksToDelete.map(network => (
                      <div key={network.id} className="text-sm text-gray-600 py-1">
                        {network.name}
                      </div>
                    ))}
                  </div>
                  <p className="text-red-600 text-sm mb-6">
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setNetworksToDelete([])}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBulkDelete}
                      disabled={bulkDeleteLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {bulkDeleteLoading ? 'Deleting...' : 'Delete Selected'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="p-6">
              {selectedNetworks.size > 0 && (
                <div className="mb-4">
                  <button
                    onClick={handleBulkDeleteClick}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Selected ({selectedNetworks.size})
                  </button>
                </div>
              )}
              <div className="overflow-x-scroll">
                <table className="min-w-[1024px] w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedNetworks.size === filteredNetworks.length && filteredNetworks.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scope
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subnet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Containers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNetworks.map((network) => (
                      <tr key={network.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedNetworks.has(network.id)}
                            onChange={() => handleSelectNetwork(network.id)}
                            disabled={network.inUse}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {network.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <Link
                            href={`/networks/${network.id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {network.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {network.driver}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {network.scope}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {network.ipam && network.ipam[0]?.Subnet || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {network.ipam && network.ipam[0]?.Gateway || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {network.containers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleBulkDeleteClick()}
                            disabled={network.inUse}
                            className={`
                              px-3 py-1 rounded text-white
                              ${network.inUse
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                              }
                              disabled:opacity-50
                            `}
                            title={network.inUse ? 'Network is in use' : 'Delete network'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredNetworks.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No networks found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
} 