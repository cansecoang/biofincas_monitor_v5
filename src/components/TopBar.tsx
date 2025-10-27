'use client';

import { Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTabsContext } from '@/contexts/TabsContext';
import { useState, useRef, useEffect, Suspense } from 'react';
import NotificationsModal from '@/components/NotificationsModal';
import IndicatorDetailModal from '@/components/IndicatorDetailModal';
import { IndicatorPerformance } from '@/types/indicators';

function TopBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tabs } = useTabsContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    products: Array<{ product_id: number; product_name: string; country_name?: string }>;
    indicators: Array<{ indicator_id: number; indicator_code: string; indicator_name: string; workpackage_name?: string }>;
  }>({ products: [], indicators: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorPerformance | undefined>(undefined);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ products: [], indicators: [] });
      setIsSearchOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const [productsRes, indicatorsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/indicators')
        ]);

        const productsData = await productsRes.json();
        const indicatorsData = await indicatorsRes.json();

        const searchLower = searchQuery.toLowerCase();

        const filteredProducts = productsData.success
          ? productsData.products
              .filter((p: any) => 
                p.product_name && p.product_name.toLowerCase().includes(searchLower)
              )
              .slice(0, 5)
          : [];

        const filteredIndicators = indicatorsData.success
          ? indicatorsData.indicators
              .filter((i: any) => 
                (i.indicator_code && i.indicator_code.toLowerCase().includes(searchLower)) ||
                (i.indicator_name && i.indicator_name.toLowerCase().includes(searchLower))
              )
              .slice(0, 5)
          : [];

        setSearchResults({
          products: filteredProducts,
          indicators: filteredIndicators
        });
        setIsSearchOpen(true);
      } catch (error) {
        console.error('Error searching:', error);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Función para obtener detalles completos del indicador por indicator_code
  const handleIndicatorClick = async (indicatorCode: string) => {
    try {
      const res = await fetch(`/api/indicator-detail?indicator_code=${encodeURIComponent(indicatorCode)}`);
      const data = await res.json();
      console.log('🔍 TOPBAR - API Response:', data);
      console.log('🔍 TOPBAR - Indicator data:', data.indicator);
      if (data.success && data.indicator) {
        setSelectedIndicator(data.indicator);
        setIsIndicatorModalOpen(true);
        setSearchQuery('');
        setIsSearchOpen(false);
      }
    } catch (error) {
      console.error('Error fetching indicator details:', error);
    }
  };

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
              const queryString = searchParams.toString();
              const href = queryString ? `${tab.href}?${queryString}` : tab.href;
              
              return (
                <Link
                  key={tab.id}
                  href={href}
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
          <div className="relative hidden md:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products, indicators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
            />

            {/* Search Results Dropdown */}
            {isSearchOpen && (searchResults.products.length > 0 || searchResults.indicators.length > 0) && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                {/* Products Section */}
                {searchResults.products.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Products ({searchResults.products.length})
                    </div>
                    {searchResults.products.map((product) => (
                      <Link
                        key={product.product_id}
                        href={`/products/list?productId=${product.product_id}`}
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                          <p className="text-xs text-gray-500">{product.country_name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Indicators Section */}
                {searchResults.indicators.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100">
                      Indicators ({searchResults.indicators.length})
                    </div>
                    {searchResults.indicators.map((indicator) => (
                      <button
                        key={indicator.indicator_id}
                        onClick={() => handleIndicatorClick(indicator.indicator_code)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-gray-900 truncate">
                            <span className="text-green-600 font-semibold">META {indicator.indicator_code}</span>
                          </p>
                          <p className="text-xs text-gray-500">{indicator.workpackage_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.trim().length >= 2 && searchResults.products.length === 0 && searchResults.indicators.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">No results found for &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
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

      {/* Indicator Detail Modal */}
      <IndicatorDetailModal
        open={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        indicator={selectedIndicator}
        onProductClick={(productId) => {
          // Esta función ya no es necesaria porque el modal maneja la navegación internamente
        }}
      />
    </header>
  );
}

export default function TopBar() {
  return (
    <Suspense fallback={
      <header className="fixed top-0 left-0 right-0 bg-gray-50 z-50">
        <div className="h-16 flex items-center justify-between px-6">
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
          </div>
        </div>
      </header>
    }>
      <TopBarContent />
    </Suspense>
  );
}
