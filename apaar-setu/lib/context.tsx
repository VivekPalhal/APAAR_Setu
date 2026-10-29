'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Role } from '@/lib/data';

interface AppContextType {
  role: Role;
  setRole: (r: Role) => void;
}

const AppContext = createContext<AppContextType>({ role: 'regulator', setRole: () => {} });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('regulator');
  return <AppContext.Provider value={{ role, setRole }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
