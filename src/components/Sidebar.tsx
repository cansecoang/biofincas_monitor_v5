'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  PackageSearch, 
  Plus, 
  Target
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 bg-gray-50 flex flex-col items-center py-6 z-40">
      {/* Logo/Dashboard Button at Top */}
      <Link
        href="/"
        className={`
          w-10 h-10 rounded-full mb-8 flex items-center justify-center transition-all duration-200
          ${isActive('/') && pathname === '/' 
            ? 'bg-slate-800 text-white shadow-md' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <LayoutGrid size={20} />
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3 w-full px-4">
        {navItems.slice(1).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
              ${isActive(item.href) 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }
            `}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </nav>

      {/* Add Button at Bottom */}
      <button
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        title="Add New"
      >
        <Plus size={20} />
      </button>
    </aside>
  );
}
