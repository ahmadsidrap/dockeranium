import { useEffect, useRef, useState } from 'react'

interface LogViewerProps {
  containerId: string | null
  isOpen: boolean
  onClose: () => void
  isRunning: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

//TODO: Fix scroll to bottom on new logs
export default function LogViewer({ containerId, isOpen, onClose, isRunning }: LogViewerProps) {
  const [logs, setLogs] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(12)  // Base font size in pixels
  const logRef = useRef<HTMLPreElement>(null)
  
  // Add ref for interval to allow cleanup
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isOpen && containerId) {
      fetchLogs()
      // Only set interval if the container is running
      if (isRunning) {
        intervalRef.current = setInterval(fetchLogs, 2000)
      }
    }

    // Cleanup interval when component unmounts or container/open state changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [containerId, isOpen, isRunning])

  const fetchLogs = async () => {
    if (!containerId) return
    
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/containers/${containerId}/logs/`)
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setLogs(data.logs)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
      setLogs('Failed to load logs')
    } finally {
      setLoading(false)
      // Scroll to bottom after logs are updated
      setTimeout(() => {
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight
        }
      }, 0) // Use setTimeout to ensure it runs after the DOM update
    }
  }

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 2, 24))  // Max 24px
  }

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 2, 8))   // Min 8px
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-2/3 h-1/3 bg-gray-900 rounded-lg shadow-xl border border-gray-700 flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-gray-700">
        <h3 className="text-lg font-medium text-gray-200">Container Logs</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="text-gray-400 hover:text-gray-200 p-1"
            title="Zoom Out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={handleZoomIn}
            className="text-gray-400 hover:text-gray-200 p-1"
            title="Zoom In"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 ml-2"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-auto bg-gray-800 font-mono">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">Loading logs...</span>
          </div>
        ) : (
          <pre 
            ref={logRef} 
            className="whitespace-pre-wrap h-full overflow-auto text-gray-300"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
          >
            {logs}
          </pre>
        )}
      </div>
    </div>
  )
}