'use client'

import { useState } from 'react'
import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 right-0 left-0 z-40">
        <Header sidebarOpen={sidebarOpen} />
      </div>

      <div className="flex">
        <div 
          className={`fixed inset-y-0 left-0 bg-gray-900 text-white z-40 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <Sidebar />
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-20 z-41 p-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 focus:outline-none transition-all duration-300"
          style={{ transform: `translateX(${sidebarOpen ? '256px' : '0px'})` }}
        >
          <svg 
            className={`h-5 w-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="sr-only">
            {sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          </span>
        </button>

        <main 
          className={`flex-1 mt-16 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="pl-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 