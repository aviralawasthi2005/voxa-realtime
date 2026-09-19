import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';

export const ConnectionBanner = () => {
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const [showOnlineFlash, setShowOnlineFlash] = useState(false);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      setShowOnlineFlash(true);
      const timer = setTimeout(() => setShowOnlineFlash(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  if (connectionStatus === 'reconnecting') {
    return (
      <div className="bg-amber-950/90 text-amber-200 border-b border-amber-800/60 px-4 py-1.5 text-xs flex items-center justify-center gap-2 z-50 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
        <span className="font-mono tracking-tight">Connection interrupted · reconnecting to VOXA server</span>
      </div>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="bg-rose-950/90 text-rose-200 border-b border-rose-800/60 px-4 py-1.5 text-xs flex items-center justify-center gap-2 z-50">
        <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        <span className="font-mono tracking-tight">Offline · Retrying connection automatically</span>
      </div>
    );
  }

  if (showOnlineFlash) {
    return (
      <div className="bg-emerald-950/80 text-emerald-200 border-b border-emerald-800/40 px-4 py-1 text-xs flex items-center justify-center gap-1.5 z-50 transition-all duration-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span className="font-mono tracking-tight text-[11px]">Back online · Synced</span>
      </div>
    );
  }

  return null;
};

export default ConnectionBanner;
