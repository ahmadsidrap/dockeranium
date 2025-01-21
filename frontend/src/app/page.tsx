'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface SystemStats {
  cpu: {
    cores: number
    usage_per_core: number[]
    average_usage: number
    frequency: {
      current: number
      min: number
      max: number
    } | null
  }
  memory: {
    total: number
    available: number
    used: number
    percent: number
  }
  disk: {
    total: number
    used: number
    free: number
    percent: number
  }
  network: {
    interfaces: {
      [key: string]: {
        addresses: Array<{
          address: string
          family: string
          netmask: string
        }>
      }
    }
    io: {
      bytes_sent: number
      bytes_recv: number
      packets_sent: number
      packets_recv: number
    }
  }
}

interface DashboardStats {
  containers: {
    total: number
    running: number
    stopped: number
  }
  images: number
  networks: number
  volumes: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function DashboardPage() {
  const [dockerStats, setDockerStats] = useState<DashboardStats | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dockerResponse, systemResponse] = await Promise.all([
          fetch(`${API_URL}/api/stats`),
          fetch(`${API_URL}/api/system/stats`)
        ])
        
        if (!dockerResponse.ok || !systemResponse.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const dockerData = await dockerResponse.json()
        const systemData = await systemResponse.json()
        
        setDockerStats(dockerData)
        setSystemStats(systemData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
        </div>

        {loading && (
          <div className="text-center py-4">Loading stats...</div>
        )}

        {error && (
          <div className="text-red-500 px-6 py-4">{error}</div>
        )}

        {!loading && !error && dockerStats && systemStats && (
          <div className="p-6 space-y-6">
            {/* Docker Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/containers" className="block">
                <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
                  <h3 className="text-lg font-medium text-blue-700">Containers</h3>
                  <div className="mt-2 text-3xl font-semibold text-blue-900">{dockerStats.containers.total}</div>
                  <div className="mt-2 text-sm text-blue-600">
                    <span className="text-green-600">{dockerStats.containers.running} running</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-600">{dockerStats.containers.stopped} stopped</span>
                  </div>
                </div>
              </Link>

              <Link href="/images" className="block">
                <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
                  <h3 className="text-lg font-medium text-purple-700">Images</h3>
                  <div className="mt-2 text-3xl font-semibold text-purple-900">{dockerStats.images}</div>
                  <div className="mt-2 text-sm text-purple-600">Total local images</div>
                </div>
              </Link>

              <Link href="/networks" className="block">
                <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
                  <h3 className="text-lg font-medium text-green-700">Networks</h3>
                  <div className="mt-2 text-3xl font-semibold text-green-900">{dockerStats.networks}</div>
                  <div className="mt-2 text-sm text-green-600">Total networks</div>
                </div>
              </Link>

              <Link href="/volumes" className="block">
                <div className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors">
                  <h3 className="text-lg font-medium text-yellow-700">Volumes</h3>
                  <div className="mt-2 text-3xl font-semibold text-yellow-900">{dockerStats.volumes}</div>
                  <div className="mt-2 text-sm text-yellow-600">Total volumes</div>
                </div>
              </Link>
            </div>

            {/* System Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU Usage */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">CPU Usage</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Cores: {systemStats.cpu.cores}</p>
                    <p className="text-sm text-gray-500">
                      Average Usage: {systemStats.cpu.average_usage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    {systemStats.cpu.usage_per_core.map((usage, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Core {index}</span>
                          <span>{usage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Memory Usage</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Used Memory</span>
                      <span>{systemStats.memory.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: `${systemStats.memory.percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">{formatBytes(systemStats.memory.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Available</p>
                      <p className="font-medium">{formatBytes(systemStats.memory.available)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Used</p>
                      <p className="font-medium">{formatBytes(systemStats.memory.used)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Disk Usage</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Used Space</span>
                      <span>{systemStats.disk.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 rounded-full h-2"
                        style={{ width: `${systemStats.disk.percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">{formatBytes(systemStats.disk.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Free</p>
                      <p className="font-medium">{formatBytes(systemStats.disk.free)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Used</p>
                      <p className="font-medium">{formatBytes(systemStats.disk.used)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Interfaces */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Network Interfaces</h3>
                <div className="space-y-4">
                  {Object.entries(systemStats.network.interfaces).map(([name, interface_]) => (
                    <div key={name} className="border-b last:border-0 pb-4 last:pb-0">
                      <h4 className="font-medium mb-2">{name}</h4>
                      {interface_.addresses.map((addr, index) => (
                        <div key={index} className="text-sm">
                          <p>
                            <span className="text-gray-500">IP:</span> {addr.address}
                          </p>
                          <p>
                            <span className="text-gray-500">Netmask:</span> {addr.netmask}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                    <div>
                      <p className="text-gray-500">Data Sent</p>
                      <p className="font-medium">{formatBytes(systemStats.network.io.bytes_sent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data Received</p>
                      <p className="font-medium">{formatBytes(systemStats.network.io.bytes_recv)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 