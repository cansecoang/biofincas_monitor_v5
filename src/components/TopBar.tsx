'use client';

import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTabsContext } from '@/contexts/TabsContext';
import { useState, useRef, useEffect } from 'react';
import NotificationsModal from '@/components/NotificationsModal';

export default function TopBar() {
  const pathname = usePathname();
  const { tabs } = useTabsContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-50 z-50">
      {/* Top Section: Logo, Search, User */}
      <div className="h-16 flex items-center justify-between px-6">

        {/* Site ID / Brand */}
        <div className="flex items-center gap-3">

          <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 relative">
              <Image 
                src="/biofincas.png" 
                alt="Biofincas Logo" 
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <h1 className="text-s font-semibold text-gray-900">Biofincas</h1>
          </Link>

          {/* Tabs Section - Rendered dynamically */}
      {tabs.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="flex items-center gap-1 px-6">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    relative px-6 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

        </div>

      

        {/* Right Side: Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                <span className="text-white font-semibold text-sm">OV</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900">Oro Verde</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`hidden lg:block text-gray-500 transition-transform ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Oro Verde</p>
                  <p className="text-xs text-gray-500">admin@biofincas.com</p>
                </div>

                {/* Menu Items */}
                <div className="py-1 ">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      // Aquí puedes agregar la lógica de logout
                      console.log('Logging out...');
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </header>
  );
}
