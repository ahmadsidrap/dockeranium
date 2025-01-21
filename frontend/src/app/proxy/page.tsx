'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Container {
  id: string
  name: string
  image: string
  ports: {
    [key: string]: Array<{
      HostIp: string
      HostPort: string
    }> | null
  }
  networks: Array<{
    name: string
    ipAddress: string
  }>
}

export default function ProxyPage() {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRunningContainers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/containers/running`)
        if (!response.ok) throw new Error('Failed to fetch running containers')
        const data = await response.json()
        setContainers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch running containers')
      } finally {
        setLoading(false)
      }
    }

    fetchRunningContainers()
  }, [])

  const formatPorts = (ports: Container['ports']) => {
    if (!ports || Object.keys(ports).length === 0) return 'No ports exposed'
    
    return Object.entries(ports).map(([containerPort, hostBindings]) => {
      if (!hostBindings) return `${containerPort} (not published)`
      
      return hostBindings.map(binding => {
        const hostIp = binding.HostIp === '0.0.0.0' ? 'all interfaces' : binding.HostIp
        return `${hostIp}:${binding.HostPort} → ${containerPort}`
      }).join(', ')
    }).join('\n')
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Reverse Proxy Management</h2>
        </div>

        {loading && (
          <div className="text-center py-4">Loading running containers...</div>
        )}

        {error && (
          <div className="text-red-500 px-6 py-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="p-6">
            <div className="overflow-x-scroll">
              <table className="min-w-[1024px] w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Container
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Port Mappings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Networks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {containers.map((container) => (
                    <tr key={container.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/containers/${container.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {container.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {container.image}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-line">
                        {formatPorts(container.ports)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {container.networks.map(net => (
                          <div key={net.name} className="mb-1 last:mb-0">
                            <Link
                              href={`/networks/${net.name}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {net.name}
                            </Link>
                            <span className="text-gray-400 ml-2">({net.ipAddress})</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => {/* TODO: Implement proxy configuration */}}
                        >
                          Configure Proxy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 