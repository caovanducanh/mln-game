'use client';

import { useGameStore } from '@/store/useGameStore';

export default function DashboardPage() {
  const { economy, companies, events, roundTimer, workerInfo, user } = useGameStore();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">
        📊 Tổng Quan Kinh Tế
      </h1>

      {/* Economy Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="GDP Lớp"
          value={`$${(economy?.gdp ?? 0).toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Lương Trung Bình"
          value={`$${(economy?.avgSalary ?? 0).toFixed(2)}`}
          icon="💵"
          color="blue"
        />
        <StatCard
          title="Tỷ Lệ Thất Nghiệp"
          value={`${(economy?.unemploymentRate ?? 0).toFixed(1)}%`}
          icon="📉"
          color={Number(economy?.unemploymentRate ?? 0) > 20 ? 'red' : 'amber'}
        />
        <StatCard
          title="Sản Phẩm Đã Bán"
          value={String(economy?.totalProductsSold ?? 0)}
          icon="📦"
          color="purple"
        />
      </div>

      {/* Second row: Workers & Companies */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Nhân Viên"
          value={String(economy?.totalWorkers ?? 0)}
          icon="👷"
          color="blue"
        />
        <StatCard
          title="Đang Thất Nghiệp"
          value={String(economy?.unemployedWorkers ?? 0)}
          icon="😢"
          color="red"
        />
        <StatCard
          title="Tổng Công Ty"
          value={String(economy?.totalCompanies ?? 0)}
          icon="🏢"
          color="green"
        />
        <StatCard
          title="Đã Phá Sản"
          value={String(economy?.bankruptCompanies ?? 0)}
          icon="💀"
          color="red"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Status */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            👤 Trạng Thái Của Bạn
          </h2>
          {user && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tên</span>
                <span className="font-semibold">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Vai trò</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'ADMIN' ? '👑 Quản trị' : '🎮 Người chơi'}
                </span>
              </div>
              {workerInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Công ty</span>
                    <span className="font-semibold">
                      {workerInfo.companyName || '😢 Thất nghiệp'}
                    </span>
                  </div>
                  {workerInfo.salary != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Lương</span>
                      <span className="font-semibold text-green-400">${workerInfo.salary}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Event Feed */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📰 Sự Kiện Mới Nhất
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events && events.length > 0 ? (
              events.map((event, i) => (
                <div key={event.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 animate-slide-up">
                  <span className="text-xl">
                    {event.type === 'ECONOMIC_CRISIS' && '📉'}
                    {event.type === 'MARKET_BOOM' && '📈'}
                    {event.type === 'LABOR_LAW' && '📜'}
                    {event.type === 'WORKER_STRIKE' && '✊'}
                    {event.type === 'TAX_POLICY' && '🏛️'}
                    {event.type === 'CORRUPTION_SCANDAL' && '🧨'}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Vòng {event.roundNumber}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Chưa có sự kiện nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Round Timer */}
      {roundTimer && roundTimer.status === 'RUNNING' && (
        <div className="glass-card p-6 text-center stat-card-green">
          <div className="flex items-center justify-center gap-4">
            <div className="timer-circle">
              <span className="text-2xl font-bold text-green-400 tabular-nums">
                {roundTimer.timeRemaining}
              </span>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-green-400">Vòng {roundTimer.round} đang diễn ra</p>
              <p className="text-sm text-gray-400">
                Hãy hành động: tuyển nhân viên, điều chỉnh lương, phá hoại đối thủ...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Companies Mini */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">🏆 Top Công Ty</h2>
        <div className="space-y-3">
          {companies && companies
            .filter((c: any) => !c.bankrupt)
            .sort((a: any, b: any) => b.budget - a.budget)
            .slice(0, 5)
            .map((company: any, index: number) => (
              <div key={company.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-500 w-8">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.currentWorkers}/{company.maxWorkers} nhân viên</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">${Number(company.budget).toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-xs">⭐</span>
                    <span className="text-xs text-amber-400">{company.reputation}</span>
                  </div>
                </div>
              </div>
            ))}
          {(!companies || companies.length === 0) && (
            <p className="text-gray-500 text-sm">Chưa có công ty nào</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'stat-card-green border-green-500/20',
    red: 'stat-card-red border-red-500/20',
    amber: 'stat-card-amber border-amber-500/20',
    blue: 'stat-card-blue border-blue-500/20',
    purple: 'stat-card-purple border-purple-500/20',
  };
  const textClasses: Record<string, string> = {
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`glass-card p-5 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${textClasses[color]} tabular-nums`}>{value}</p>
    </div>
  );
}
