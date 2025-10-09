'use client';

import { useEffect, ReactNode } from 'react';
import { useTabsContext } from '@/contexts/TabsContext';

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface TabsLayoutProps {
  tabs: Tab[];
  basePath: string;
  children: ReactNode;
}

export default function TabsLayout({ tabs, basePath, children }: TabsLayoutProps) {
  const { setTabs } = useTabsContext();

  useEffect(() => {
    // Registrar las tabs en el contexto cuando el componente se monta
    setTabs(tabs, basePath);

    // Limpiar las tabs cuando el componente se desmonta
    return () => {
      setTabs([], '');
    };
  }, [tabs, basePath, setTabs]);

  return (
    <div className="px-3 py-6">
      {children}
    </div>
  );
}
