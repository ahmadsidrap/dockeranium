'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface Image {
  id: string
  tags: string[]
  size: number
  created: string
  architecture: string
  os: string
}

interface SystemStats {
  memory: {
    total: number
    used: number
    percent: number
  }
  disk: {
    total: number
    used: number
    free: number
    percent: number
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<Image[]>([])

  const fetchData = async () => {
    try {
      const [imagesResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/images`),
        fetch(`${API_URL}/api/system/stats`)
      ])

      if (!imagesResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const imagesData = await imagesResponse.json()
      const statsData = await statsResponse.json()
      
      setImages(imagesData)
      setSystemStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteClick = (image: Image) => {
    setImageToDelete(image)
  }

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return

    try {
      setDeleteLoading(imageToDelete.id)
      const imageId = imageToDelete.id.replace('sha256:', '')
      const response = await fetch(`${API_URL}/api/images/${imageId}/`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete image')
      }
      
      await fetchData() // Refresh the list after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setDeleteLoading(null)
      setImageToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setImageToDelete(null)
  }

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

  const filteredImages = images.filter(image => {
    const searchLower = searchTerm.toLowerCase()
    return image.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
           image.id.toLowerCase().includes(searchLower)
  })

  const handleSelectImage = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(filteredImages.map(img => img.id)))
    }
  }

  const handleBulkDeleteClick = () => {
    const imagesToDelete = filteredImages.filter(img => selectedImages.has(img.id))
    setImagesToDelete(imagesToDelete)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true)
      
      // Delete images sequentially to avoid overwhelming the server
      for (const image of imagesToDelete) {
        const imageId = image.id.replace('sha256:', '')
        const response = await fetch(`${API_URL}/api/images/${imageId}/`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `Failed to delete image ${image.tags[0] || image.id}`)
        }
      }
      
      await fetchData() // Refresh the list after deletion
      setSelectedImages(new Set()) // Clear selection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete images')
    } finally {
      setBulkDeleteLoading(false)
      setImagesToDelete([])
    }
  }

  return (
    <DashboardLayout>
      <div className="bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold mb-2">Images</h2>
          {systemStats && (
            <div className="flex space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Host Memory:</span>{' '}
                {formatBytes(systemStats.memory.used)} / {formatBytes(systemStats.memory.total)} ({systemStats.memory.percent}% used)
              </div>
              <div>
                <span className="font-medium">Host Storage:</span>{' '}
                {formatBytes(systemStats.disk.used)} / {formatBytes(systemStats.disk.total)} ({systemStats.disk.percent}% used)
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pt-4">
          <div className="max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Images
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">Loading images...</div>
        )}

        {error && (
          <div className="text-red-500 px-6 py-4">{error}</div>
        )}

        {imagesToDelete.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete these {imagesToDelete.length} images?
              </p>
              <div className="max-h-40 overflow-y-auto mb-6">
                {imagesToDelete.map(image => (
                  <div key={image.id} className="text-sm text-gray-600 py-1">
                    {image.tags.length > 0 ? image.tags[0] : image.id}
                  </div>
                ))}
              </div>
              <p className="text-red-600 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setImagesToDelete([])}
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

        {!loading && !error && (
          <div className="p-6">
            {selectedImages.size > 0 && (
              <div className="mb-4">
                <button
                  onClick={handleBulkDeleteClick}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected ({selectedImages.size})
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
                        checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredImages.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => handleSelectImage(image.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <Link
                          href={`/images/${image.id.replace('sha256:', '')}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {image.id.replace('sha256:', '')}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {image.tags.length > 0 ? image.tags.join(', ') : '<none>'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(image.size)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(image.created).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {`${image.os}/${image.architecture}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteClick(image)}
                          disabled={deleteLoading === image.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredImages.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No images found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 