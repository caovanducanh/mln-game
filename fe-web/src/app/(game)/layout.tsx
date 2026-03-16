'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { api } from '@/lib/api';
import { connectWebSocket } from '@/lib/websocket';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, setGameState, setEconomy, setCompanies, setLeaderboard, addEvent, setRoundTimer, setWorkerInfo } = useGameStore();

  useEffect(() => {
    // Load user
    api.getMe().then((res) => {
      if (res.success) {
        setUser(res.data);
      } else {
        window.location.href = '/';
      }
    }).catch(() => {
      window.location.href = '/';
    });

    // Load worker info
    api.getMyWorker().then((res) => {
      if (res.success) setWorkerInfo(res.data);
    });

    // Load game state
    api.getGameState().then((res) => {
      if (res.success) setGameState(res.data);
    });

    // Connect WebSocket
    connectWebSocket({
      onEconomy: (data) => setEconomy(data),
      onCompanies: (data) => {
        if (Array.isArray(data)) setCompanies(data);
        else api.getGameState().then((res) => { if (res.success) setGameState(res.data); });
      },
      onLeaderboard: (data) => setLeaderboard(data),
      onEvents: (data) => addEvent(data),
      onRoundTimer: (data) => setRoundTimer(data),
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 pb-8">
        {children}
      </main>
      <Notifications />
    </div>
  );
}

function Notifications() {
  const { notifications, removeNotification } = useGameStore();

  useEffect(() => {
    notifications.forEach((n) => {
      setTimeout(() => removeNotification(n.id), 4000);
    });
  }, [notifications]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`toast toast-${n.type} cursor-pointer`}
          onClick={() => removeNotification(n.id)}
        >
          {n.type === 'success' && '✅ '}
          {n.type === 'error' && '❌ '}
          {n.type === 'info' && 'ℹ️ '}
          {n.message}
        </div>
      ))}
    </div>
  );
}
