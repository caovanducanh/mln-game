'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
  { href: '/companies', label: 'Công ty', icon: '🏢' },
  { href: '/game', label: 'Bảng xếp hạng', icon: '🏆' },
  { href: '/admin', label: 'Quản trị', icon: '⚙️', adminOnly: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, roundTimer } = useGameStore();

  return (
    <nav className="glass-card mx-4 mt-4 mb-6 px-6 py-3 flex items-center justify-between" style={{ borderRadius: '16px' }}>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-2xl">🏭</span>
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-teal-300 transition-all">
            EconGame
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Round Timer */}
        {roundTimer && roundTimer.status === 'RUNNING' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400">
              Vòng {roundTimer.round}
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              {roundTimer.timeRemaining}s
            </span>
          </div>
        )}

        {/* User */}
        {user && (
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full ring-2 ring-green-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-bold text-green-400">
                {user.name?.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'ADMIN' ? '👑 Quản trị viên' : '🎮 Người chơi'}
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
