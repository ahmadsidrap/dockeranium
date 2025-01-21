'use client'

import Link from 'next/link'
import UserMenu from './UserMenu'

interface HeaderProps {
  sidebarOpen: boolean
}

export default function Header({ sidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white h-16 border-b">
      <div className={`flex justify-between items-center h-full transition-all duration-300 ${
        sidebarOpen ? 'pl-72' : 'pl-16'  // Reduced padding when sidebar is closed
      } pr-6`}>
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Dockeranium" className="h-8 w-8" />
            <span className="text-xl font-semibold">Dockeranium</span>
          </Link>
        </div>
        <UserMenu />
      </div>
    </header>
  )
} 