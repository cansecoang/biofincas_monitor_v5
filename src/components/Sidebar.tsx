'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutGrid, 
  PackageSearch, 
  Plus, 
  Target,
  Package,
  CheckSquare
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutGrid size={18} />,
    href: '/',
  },
  {
    id: 'products',
    label: 'Products',
    icon: <PackageSearch  size={18} />,
    href: '/products',
  },
  {
    id: 'indicators',
    label: 'Indicators',
    icon: <Target size={18} />,
    href: '/indicators',
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Blur Overlay - Visual only, no interaction */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[100] pointer-events-none blur-overlay-animate"
        />
      )}

      {/* Clickable overlay to close menu - below the buttons */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[101]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Floating Menu - Outside sidebar to have proper z-index */}
      {isMenuOpen && (
        <div className="fixed bottom-[calc(4rem+1.5rem)] left-[15px] z-[110] flex flex-col gap-3">
          {/* New Product Button */}
          <Link
            href="/create/product"
            className="group flex items-center gap-3 bg-gray-50 rounded-full pr-6 shadow-lg hover:shadow-xl hover:scale-105 menu-button-slide"
            onClick={() => setIsMenuOpen(false)}
            style={{ animationDelay: '0ms' }}
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="text-base font-medium text-gray-900 menu-text-expand">
              New Product
            </span>
          </Link>

          {/* New Task Button */}
          <Link
            href="/create/task"
            className="group flex items-center gap-3 bg-gray-50 rounded-full pr-6 shadow-lg hover:shadow-xl hover:scale-105 menu-button-slide"
            onClick={() => setIsMenuOpen(false)}
            style={{ animationDelay: '150ms' }}
          >
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="text-base font-medium text-gray-900 menu-text-expand">
              New Task
            </span>
          </Link>
        </div>
      )}

      {/* Add Button - Outside sidebar to have proper z-index */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`fixed bottom-[calc(1.5rem)] left-[15px] w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl z-[110] ${
          isMenuOpen ? 'rotate-45' : ''
        }`}
        title="Create New"
      >
        <Plus size={18} />
      </button>

      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[60px] bg-gray-50 flex flex-col items-center py-6 z-40">
      
      {/* Spacer to push navigation to center */}
      <div className="flex-[0.7]"></div>
        <nav className="flex flex-col gap-3 items-center">
            
            {/* Logo/Dashboard Button at Top */}
            <div className="relative group">
              <Link
                  href="/"
                  className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                  ${isActive('/') && pathname === '/' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }
                  `}
              >
                  <LayoutGrid size={18} />
              </Link>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-lg">
                Dashboard
              </div>
            </div>

            {/* Navigation Items - Centered */}
            {navItems.slice(1).map((item) => (
            <div key={item.id} className="relative group">
              <Link
                  href={item.href}
                  className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                  ${isActive(item.href) 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }
                  `}
              >
                  {item.icon}
              </Link>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-lg">
                {item.label}
              </div>
            </div>
            ))}
        </nav>
      {/* Spacer to push add button to bottom */}
      <div className="flex-[1.3]"></div>

      </aside>
    </>
  );
}
