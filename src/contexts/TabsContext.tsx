'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface TabsContextType {
  tabs: Tab[];
  basePath: string;
  setTabs: (tabs: Tab[], basePath: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  tabs: [],
  basePath: '',
  setTabs: () => {},
});

export const useTabsContext = () => useContext(TabsContext);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabsState] = useState<Tab[]>([]);
  const [basePath, setBasePath] = useState<string>('');

  const setTabs = (newTabs: Tab[], newBasePath: string) => {
    setTabsState(newTabs);
    setBasePath(newBasePath);
  };

  return (
    <TabsContext.Provider value={{ tabs, basePath, setTabs }}>
      {children}
    </TabsContext.Provider>
  );
}
