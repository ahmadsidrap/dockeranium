'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { PageParams } from '@/types/params'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ImageDetail {
  id: string
  tags: string[]
  size: number
  created: string
  architecture: string
  os: string
  author: string
  config: {
    Env: string[]
    Cmd: string[]
    WorkingDir: string
    ExposedPorts: Record<string, any>
    Labels: Record<string, string>
    User: string
  }
  history: Array<{
    Created: string
    CreatedBy: string
    Comment: string
  }>
}

export default function ImageDetailPage() {
  const params = useParams() as PageParams
  const imageId = params.id
  const [image, setImage] = useState<ImageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImageDetail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/images/${imageId}/`)
        if (!response.ok) throw new Error('Failed to fetch image details')
        const data = await response.json()
        setImage(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch image details')
      } finally {
        setLoading(false)
      }
    }

    fetchImageDetail()
  }, [imageId])

  const formatSize = (size: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let formattedSize = size
    let unitIndex = 0
    
    while (formattedSize >= 1024 && unitIndex < units.length - 1) {
      formattedSize /= 1024
      unitIndex++
    }
    
    return `${formattedSize.toFixed(2)} ${units[unitIndex]}`
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold">Image Details</h2>
        </div>

        {loading && (
          <div className="text-center py-4">Loading image details...</div>
        )}

        {error && (
          <div className="text-red-500 px-6 py-4">{error}</div>
        )}

        {!loading && !error && image && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">ID:</span> {image.id}</p>
                  <p><span className="font-medium">Tags:</span> {image.tags.join(', ') || '<none>'}</p>
                  <p><span className="font-medium">Size:</span> {formatSize(image.size)}</p>
                  <p><span className="font-medium">Created:</span> {new Date(image.created).toLocaleString()}</p>
                  <p><span className="font-medium">Platform:</span> {`${image.os}/${image.architecture}`}</p>
                  {image.author && <p><span className="font-medium">Author:</span> {image.author}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {image.config.WorkingDir && (
                    <p><span className="font-medium">Working Directory:</span> {image.config.WorkingDir}</p>
                  )}
                  {image.config.User && (
                    <p><span className="font-medium">User:</span> {image.config.User}</p>
                  )}
                  {image.config.Cmd && image.config.Cmd.length > 0 && (
                    <p><span className="font-medium">Command:</span> {image.config.Cmd.join(' ')}</p>
                  )}
                  {image.config.ExposedPorts && Object.keys(image.config.ExposedPorts).length > 0 && (
                    <p><span className="font-medium">Exposed Ports:</span> {Object.keys(image.config.ExposedPorts).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            {image.config.Env && image.config.Env.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {image.config.Env.join('\n')}
                  </pre>
                </div>
              </div>
            )}

            {image.history && image.history.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">History</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    {image.history.map((entry, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <p className="text-sm text-gray-500">{new Date(entry.Created).toLocaleString()}</p>
                        <p className="text-sm mt-1">{entry.CreatedBy}</p>
                        {entry.Comment && <p className="text-sm text-gray-600 mt-1">{entry.Comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 