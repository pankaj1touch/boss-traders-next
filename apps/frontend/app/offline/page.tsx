'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function OfflinePage() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <WifiOff className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">You're Offline</h1>
          <p className="text-muted-foreground mb-8">
            It looks like you're not connected to the internet. Please check your connection and try again.
          </p>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}


