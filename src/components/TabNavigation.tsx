'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface TabNavigationProps {
  basePath: string;
  tabs: Tab[];
}

export default function TabNavigation({ basePath, tabs }: TabNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 px-6">
        {tabs.map((tab) => {
          const isTabActive = isActive(tab.href);
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                relative px-6 py-4 text-sm font-medium transition-colors
                ${isTabActive 
                  ? 'text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab.label}
              {isTabActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
