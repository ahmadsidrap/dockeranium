'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      setLogoutError(null)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      router.push('/login')
      router.refresh()
      
    } catch (error) {
      setLogoutError('Failed to logout. Please try again.')
      console.error('Logout failed:', error)
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-lg">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{username[0].toUpperCase()}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">{username}</span>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } w-full text-left px-4 py-2 text-sm text-gray-700`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            {logoutError && (
              <p className="text-red-600 mb-4 text-sm">{logoutError}</p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  setLogoutError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={logoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {logoutLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 