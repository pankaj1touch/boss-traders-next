'use client';

import { Provider } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { initializeSocket } from '@/lib/socket';
import PWAServiceWorker from '@/components/PWAServiceWorker';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const socketInitialized = useRef(false);

  // Ensure hydration is complete before rendering children
  useEffect(() => {
    // Re-initialize auth from localStorage to ensure sync after hydration
    store.dispatch(initializeAuth());
    setIsHydrated(true);
  }, []);

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (!isHydrated) return;

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
  }, [isHydrated]);

  // Show nothing or a minimal loader until hydration completes
  // This prevents flash of unauthenticated content
  if (!isHydrated) {
    return null;
  }

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

