'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from '@headlessui/react'

interface HeaderProps {
  username?: string
}

export default function Header({ username }: HeaderProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (res.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header>
      <div className="flex items-center">
        {username && (
          <span className="mr-4">{username}</span>
        )}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900">
            <span className="sr-only">Open user menu</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm">{username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </Menu.Button>

          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700 w-full text-left disabled:opacity-50`}
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  )
} 