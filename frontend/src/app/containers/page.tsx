'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import LogViewer from '@/components/LogViewer'

interface Container {
  id: string
  name: string
  image: string
  status: string
  state: {
    Running: boolean
    Status: string
  }
  created: string
  ports: Record<string, any>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [containersToDelete, setContainersToDelete] = useState<Container[]>([])
  const [stateFilter, setStateFilter] = useState<'all' | 'running' | 'disconnected'>('all')
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/containers`)
      if (!response.ok) throw new Error('Failed to fetch containers')
      const data = await response.json()
      setContainers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch containers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [])

  const handleAction = async (containerId: string, action: 'start' | 'stop') => {
    try {
      setActionLoading(containerId)
      const response = await fetch(`${API_URL}/api/containers/${containerId}/${action}/`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error(`Failed to ${action} container`)
      await fetchContainers()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} container`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSelectContainer = (containerId: string) => {
    const newSelected = new Set(selectedContainers)
    if (newSelected.has(containerId)) {
      newSelected.delete(containerId)
    } else {
      newSelected.add(containerId)
    }
    setSelectedContainers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedContainers.size === filteredContainers.length) {
      setSelectedContainers(new Set())
    } else {
      setSelectedContainers(new Set(filteredContainers.map(container => container.id)))
    }
  }

  const handleBulkDeleteClick = () => {
    const containersToDelete = filteredContainers.filter(container => 
      selectedContainers.has(container.id) && !container.state.Running
    )
    setContainersToDelete(containersToDelete)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true)
      
      for (const container of containersToDelete) {
        const response = await fetch(`${API_URL}/api/containers/${container.id}/`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to delete container ${container.name}`)
        }
      }
      
      await fetchContainers()
      setSelectedContainers(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete containers')
    } finally {
      setBulkDeleteLoading(false)
      setContainersToDelete([])
    }
  }

  const filteredContainers = containers.filter(container => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = container.name.toLowerCase().includes(searchLower) ||
           container.id.toLowerCase().includes(searchLower) ||
           container.image.toLowerCase().includes(searchLower)

    if (stateFilter === 'all') return matchesSearch
    if (stateFilter === 'running') return matchesSearch && container.state.Running
    if (stateFilter === 'disconnected') return matchesSearch && !container.state.Running
    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Containers</h2>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <div className="w-1/2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Containers
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or image..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setStateFilter('all')}
              className={`px-4 py-2 rounded ${
                stateFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStateFilter('running')}
              className={`px-4 py-2 rounded ${
                stateFilter === 'running' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Running
            </button>
            <button
              onClick={() => setStateFilter('disconnected')}
              className={`px-4 py-2 rounded ${
                stateFilter === 'disconnected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disconnected
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {containersToDelete.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete these {containersToDelete.length} containers?
              </p>
              <div className="max-h-40 overflow-y-auto mb-6">
                {containersToDelete.map(container => (
                  <div key={container.id} className="text-sm text-gray-600 py-1">
                    {container.name}
                  </div>
                ))}
              </div>
              <p className="text-red-600 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setContainersToDelete([])}
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
        {!loading && !error && (
          <div className="p-6">
            {selectedContainers.size > 0 && (
              <div className="mb-4">
                <button
                  onClick={handleBulkDeleteClick}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected ({selectedContainers.size})
                </button>
              </div>
            )}
            <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg relative z-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-0">
                      <input
                        type="checkbox"
                        checked={selectedContainers.size === filteredContainers.length && filteredContainers.length > 0}
                        onChange={handleSelectAll}
                        className="relative z-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContainers.map((container) => (
                    <tr key={container.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContainers.has(container.id)}
                          onChange={() => handleSelectContainer(container.id)}
                          disabled={container.state.Running}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate">
                        <Link
                          href={`/containers/${container.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {container.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate">{container.image}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          container.state.Running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {container.state.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate">
                        {new Date(container.created).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 space-x-2">
                        {container.state.Running ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAction(container.id, 'stop')}
                              disabled={actionLoading === container.id}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded border border-transparent shadow-sm bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {actionLoading === container.id ? 'Stopping...' : 'Stop'}
                            </button>
                            <button
                              onClick={() => setSelectedContainer(container.id)}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded border border-transparent shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                              </svg>
                              Log
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAction(container.id, 'start')}
                              disabled={actionLoading === container.id}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded border border-transparent shadow-sm bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {actionLoading === container.id ? 'Starting...' : 'Run'}
                            </button>
                            <button
                              onClick={() => setSelectedContainer(container.id)}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded border border-transparent shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                              </svg>
                              Log
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredContainers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No containers found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <LogViewer
        containerId={selectedContainer}
        isOpen={!!selectedContainer}
        onClose={() => setSelectedContainer(null)}
        isRunning={containers.find(c => c.id === selectedContainer)?.state.Running ?? false}
      />
    </DashboardLayout>
  )
} 