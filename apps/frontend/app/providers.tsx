'use client';

import { Provider } from 'react-redux';
import { useEffect, useRef } from 'react';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      store.dispatch(initializeAuth());
      initialized.current = true;
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

