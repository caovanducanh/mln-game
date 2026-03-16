'use client';

import { useGameStore } from '@/store/useGameStore';

export default function GamePage() {
  const { leaderboard, economy, roundTimer } = useGameStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">🏆 Bảng Xếp Hạng & Trò Chơi</h1>

      {/* Round Status */}
      <div className={`glass-card p-6 text-center ${roundTimer?.status === 'RUNNING' ? 'stat-card-green' : ''}`}>
        <div className="flex items-center justify-center gap-6">
          {roundTimer?.status === 'RUNNING' ? (
            <>
              <div className="timer-circle">
                <span className="text-2xl font-bold text-green-400 tabular-nums">
                  {roundTimer.timeRemaining}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-green-400">🔥 Vòng {roundTimer.round} đang diễn ra!</p>
                <p className="text-gray-400">Thời gian còn lại để hành động</p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xl font-bold text-gray-400">⏸️ Đang chờ vòng tiếp theo</p>
              <p className="text-sm text-gray-500">Quản trị viên sẽ bắt đầu vòng mới</p>
            </div>
          )}
        </div>
      </div>

      {/* Economy Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EcoCard icon="💰" label="GDP" value={`$${(economy?.gdp ?? 0).toLocaleString()}`} />
        <EcoCard icon="💵" label="Lương TB" value={`$${(economy?.avgSalary ?? 0).toFixed(2)}`} />
        <EcoCard icon="📉" label="Thất nghiệp" value={`${(economy?.unemploymentRate ?? 0).toFixed(1)}%`} />
        <EcoCard icon="📦" label="SP bán" value={String(economy?.totalProductsSold ?? 0)} />
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          🏅 Bảng Xếp Hạng Công Ty
        </h2>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
              const isTop3 = index < 3;

              return (
                <div
                  key={entry.companyId}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isTop3
                      ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl ${isTop3 ? '' : 'text-gray-500 text-sm font-bold w-8 text-center'}`}>
                      {medal}
                    </span>
                    <div>
                      <p className={`font-bold ${isTop3 ? 'text-lg' : ''}`}>{entry.companyName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">👷 {entry.workers} nhân viên</span>
                        <span className="text-xs text-gray-500">⭐ {entry.reputation} uy tín</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isTop3 ? 'text-xl' : 'text-lg'} text-green-400`}>
                      ${Number(entry.budget).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có công ty nào trong bảng xếp hạng</p>
        )}
      </div>

      {/* Game Rules */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">📋 Luật Chơi</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="space-y-2">
            <p>🏭 <strong className="text-white">Sản xuất:</strong> 1 nhân viên + $10 = 1 sản phẩm</p>
            <p>💵 <strong className="text-white">Bán hàng:</strong> 1 sản phẩm = $20</p>
            <p>💰 <strong className="text-white">Lợi nhuận:</strong> $20 - $10 - lương = lãi/nhân viên</p>
            <p>💀 <strong className="text-white">Phá sản:</strong> Ngân sách {'<'} $0 → phá sản</p>
          </div>
          <div className="space-y-2">
            <p>✊ <strong className="text-white">Đình công:</strong> Lương {'<'} $10 → nhân viên bỏ phiếu</p>
            <p>🔥 <strong className="text-white">Phá hoại:</strong> Tốn 30→40→50$ → trừ ngân sách đối thủ</p>
            <p>👑 <strong className="text-white">Thâu tóm:</strong> Cần {'>'} 1.5× ngân sách đối thủ</p>
            <p>⭐ <strong className="text-white">Uy tín:</strong> Lương cao +uy tín, đình công -uy tín</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EcoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <span className="text-xl">{icon}</span>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
