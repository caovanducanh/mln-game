'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { api } from '@/lib/api';

const EVENT_TYPES = [
  { type: 'ECONOMIC_CRISIS', label: '📉 Khủng hoảng kinh tế', desc: 'Nhu cầu giảm 50%', color: 'red' },
  { type: 'MARKET_BOOM', label: '📈 Bùng nổ thị trường', desc: 'Giá bán tăng 50%, nhu cầu ×2', color: 'green' },
  { type: 'LABOR_LAW', label: '📜 Luật lao động', desc: 'Lương tối thiểu $12', color: 'blue' },
  { type: 'WORKER_STRIKE', label: '✊ Đình công toàn ngành', desc: 'Công ty lương < $10 ngừng sản xuất', color: 'amber' },
  { type: 'TAX_POLICY', label: '🏛️ Chính sách thuế', desc: 'Thuế 20% doanh thu', color: 'purple' },
  { type: 'CORRUPTION_SCANDAL', label: '🧨 Bê bối tham nhũng', desc: '-$20 ngân sách, -20 uy tín', color: 'red' },
];

export default function AdminPage() {
  const { user, companies, addNotification, roundTimer } = useGameStore();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="glass-card p-8 inline-block">
          <span className="text-6xl">🔒</span>
          <h2 className="text-2xl font-bold mt-4">Không có quyền truy cập</h2>
          <p className="text-gray-400 mt-2">Trang này chỉ dành cho quản trị viên</p>
        </div>
      </div>
    );
  }

  const handleStartGame = async () => {
    setLoading(true);
    const res = await api.startGame();
    if (res.success) {
      addNotification('🎮 Game bắt đầu!', 'success');
      const state = await api.getGameState();
      if (state.success) useGameStore.getState().setGameState(state.data);
    } else {
      addNotification(res.message || 'Lỗi bắt đầu game', 'error');
    }
    setLoading(false);
  };

  const handleNextRound = async () => {
    setLoading(true);
    const res = await api.nextRound();
    if (res.success) {
      addNotification('🔄 Vòng mới bắt đầu!', 'success');
      const state = await api.getGameState();
      if (state.success) useGameStore.getState().setGameState(state.data);
    } else {
      addNotification(res.message || 'Lỗi vòng mới', 'error');
    }
    setLoading(false);
  };

  const handleTriggerEvent = async (type: string) => {
    setLoading(true);
    const targetId = type === 'CORRUPTION_SCANDAL' && targetCompany ? parseInt(targetCompany) : undefined;
    const res = await api.triggerEvent(type, undefined, targetId);
    if (res.success) {
      addNotification(`Sự kiện "${type}" đã kích hoạt!`, 'success');
    } else {
      addNotification(res.message || 'Lỗi kích hoạt sự kiện', 'error');
    }
    setLoading(false);
  };

  const isRunning = roundTimer?.status === 'RUNNING';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">⚙️ Bảng Điều Khiển Quản Trị</h1>

      {/* Game Controls */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">🎮 Điều Khiển Game</h2>

        <div className="flex items-center gap-4 mb-4">
          {isRunning ? (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-green-400">Vòng {roundTimer?.round} đang chạy</span>
              <span className="text-2xl font-bold text-white tabular-nums">{roundTimer?.timeRemaining}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-500/10 border border-gray-500/20">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-400">Đang chờ</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStartGame}
            disabled={loading || isRunning}
            className="btn-primary disabled:opacity-50"
          >
            🚀 Bắt Đầu Game
          </button>
          <button
            onClick={handleNextRound}
            disabled={loading || isRunning}
            className="btn-blue disabled:opacity-50"
          >
            ⏭️ Vòng Tiếp Theo
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          ⏱️ Mỗi vòng kéo dài 60 giây. Sau khi hết thời gian, hệ thống tự động xử lý: trả lương → sản xuất → bán hàng → phá sản.
        </p>
      </div>

      {/* Event Triggers */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">⚡ Kích Hoạt Sự Kiện</h2>

        {/* Scandal target selector */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 block mb-2">🎯 Chọn mục tiêu (cho bê bối tham nhũng):</label>
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className="input-dark"
          >
            <option value="">-- Không chọn --</option>
            {companies?.filter((c) => !c.bankrupt).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EVENT_TYPES.map((event) => {
            const colorMap: Record<string, string> = {
              red: 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5',
              green: 'border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5',
              blue: 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5',
              amber: 'border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5',
              purple: 'border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5',
            };

            return (
              <button
                key={event.type}
                onClick={() => handleTriggerEvent(event.type)}
                disabled={loading}
                className={`glass-card p-4 text-left transition-all border ${colorMap[event.color]} disabled:opacity-50 cursor-pointer`}
              >
                <p className="font-bold text-sm">{event.label}</p>
                <p className="text-xs text-gray-500 mt-1">{event.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">📊 Thống Kê Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-green-400">{companies?.filter((c) => !c.bankrupt).length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Công ty hoạt động</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-400">{companies?.filter((c) => c.bankrupt).length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Đã phá sản</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">{companies?.reduce((sum, c) => sum + c.currentWorkers, 0) || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Tổng nhân viên</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-400">
              ${companies?.filter((c) => !c.bankrupt).reduce((sum, c) => sum + Number(c.budget), 0).toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tổng ngân sách</p>
          </div>
        </div>
      </div>
    </div>
  );
}
