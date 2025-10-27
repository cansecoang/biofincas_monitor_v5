'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Suspense } from 'react';

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Si es la página de login, solo mostrar el contenido sin sidebar ni topbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Para todas las demás páginas, mostrar el layout completo
  return (
    <>
      {/* Sidebar - Navigation Vertical Principal (NVP) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[60px]">
        {/* TopBar - Site ID and User Info */}
        <Suspense fallback={
          <div className="fixed top-0 left-[60px] right-0 h-16 bg-white border-b border-gray-200 z-40">
            <div className="h-full px-4 flex items-center justify-between">
              <div className="text-gray-400">Loading...</div>
            </div>
          </div>
        }>
          <TopBar />
        </Suspense>
        
        {/* Content Area - padding top dinámico para TopBar + Tabs */}
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-[calc(100vw-60px)] overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
