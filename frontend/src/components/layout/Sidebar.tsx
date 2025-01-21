'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconType } from 'react-icons'
import {
  FaHome,
  FaDocker,
  FaNetworkWired,
  FaHdd,
  FaImage,
  FaRandom
} from 'react-icons/fa'
import Logo from '@/components/icons/Logo'

interface MenuItem {
  name: string
  href: string
  icon: IconType
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/', icon: FaHome },
  { name: 'Containers', href: '/containers', icon: FaDocker },
  { name: 'Images', href: '/images', icon: FaImage },
  { name: 'Networks', href: '/networks', icon: FaNetworkWired },
  { name: 'Ports', href: '/ports', icon: FaNetworkWired },
  { name: 'Volumes', href: '/volumes', icon: FaHdd },
  { name: 'Reverse Proxy', href: '/proxy', icon: FaRandom }
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (!pathname) return false
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center px-4 py-2 text-sm
                  ${isActive(item.href)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Introvesia
        </p>
      </div>
    </div>
  )
} 