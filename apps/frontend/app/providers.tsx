'use client';

import { Provider } from 'react-redux';
import { useEffect, useRef } from 'react';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { initializeSocket } from '@/lib/socket';
import PWAServiceWorker from '@/components/PWAServiceWorker';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      store.dispatch(initializeAuth());
      initialized.current = true;
    }
  }, []);

  // Initialize socket when user is authenticated
  useEffect(() => {
    const checkAuthAndInitSocket = () => {
      const state = store.getState();
      const isAuthenticated = state.auth.isAuthenticated;
      
      if (isAuthenticated && !socketInitialized.current) {
        initializeSocket();
        socketInitialized.current = true;
      } else if (!isAuthenticated && socketInitialized.current) {
        socketInitialized.current = false;
      }
    };

    // Check immediately
    checkAuthAndInitSocket();

    // Subscribe to store changes
    const unsubscribe = store.subscribe(checkAuthAndInitSocket);

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      storageKey="boss-traders-theme"
      disableTransitionOnChange={false}
    >
      <Provider store={store}>
        <PWAServiceWorker />
        <PWAInstallPrompt />
        <AuthInitializer>{children}</AuthInitializer>
      </Provider>
    </ThemeProvider>
  );
}

