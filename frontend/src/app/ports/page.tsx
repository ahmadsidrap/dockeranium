'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface PortMapping {
  HostIp: string
  HostPort: string
}

interface ContainerPort {
  containerId: string
  containerName: string
  networkId: string
  networkName: string
  ports: {
    [key: string]: PortMapping[] | null
  }
}

export default function PortsPage() {
  const [ports, setPorts] = useState<ContainerPort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPorts()
  }, [])

  const fetchPorts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ports/`)
      if (!response.ok) throw new Error('Failed to fetch ports')
      const data = await response.json()
      console.log('Ports data:', data)
      setPorts(data)
    } catch (err) {
      console.error('Error fetching ports:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ports')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Active Ports</h2>
        </div>

        {loading && (
          <div className="text-center py-4">Loading ports information...</div>
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
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Container Port</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Host Binding</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Container</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Network</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ports.map((container) => (
                    Object.entries(container.ports || {}).map(([port, mappings]) => (
                      <tr key={`${container.containerId}-${port}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{port}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mappings && mappings.length > 0 ? (
                            mappings.map((mapping, idx) => (
                              <span key={idx}>
                                {mapping.HostIp === '0.0.0.0' ? '*' : mapping.HostIp}:{mapping.HostPort}
                                {idx < mappings.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">Not published</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link 
                            href={`/containers/${container.containerId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {container.containerName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link 
                            href={`/networks/${container.networkId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {container.networkName}
                          </Link>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
              {ports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active ports found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 