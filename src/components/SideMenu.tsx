'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Affine Marken',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Alle Marken',
      path: '/all-brands',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Bereich */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className={`${isCollapsed ? 'w-8 h-8' : 'w-32 h-8'} bg-gray-200 rounded`}>
          {/* Hier später das Logo einfügen */}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
              pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="text-gray-500">{item.icon}</span>
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.title}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
} 