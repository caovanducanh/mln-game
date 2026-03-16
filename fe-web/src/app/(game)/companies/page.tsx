'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CompaniesPage() {
  const { companies, user, workerInfo, addNotification } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return;
    setLoading(true);
    try {
      const res = await api.createCompany(newCompanyName);
      if (res.success) {
        addNotification('Tạo công ty thành công!', 'success');
        setShowCreate(false);
        setNewCompanyName('');
        // Refresh
        const state = await api.getGameState();
        if (state.success) useGameStore.getState().setGameState(state.data);
      } else {
        addNotification(res.message || 'Lỗi tạo công ty', 'error');
      }
    } catch {
      addNotification('Lỗi kết nối server', 'error');
    }
    setLoading(false);
  };

  const handleJoinCompany = async (companyId: number) => {
    try {
      const res = await api.joinCompany(companyId);
      if (res.success) {
        addNotification('Đã gia nhập công ty!', 'success');
        const worker = await api.getMyWorker();
        if (worker.success) useGameStore.getState().setWorkerInfo(worker.data);
        const state = await api.getGameState();
        if (state.success) useGameStore.getState().setGameState(state.data);
      } else {
        addNotification(res.message || 'Lỗi gia nhập', 'error');
      }
    } catch {
      addNotification('Lỗi kết nối server', 'error');
    }
  };

  const handleQuit = async () => {
    try {
      const res = await api.quitCompany();
      if (res.success) {
        addNotification('Đã nghỉ việc!', 'info');
        const worker = await api.getMyWorker();
        if (worker.success) useGameStore.getState().setWorkerInfo(worker.data);
        const state = await api.getGameState();
        if (state.success) useGameStore.getState().setGameState(state.data);
      } else {
        addNotification(res.message || 'Lỗi nghỉ việc', 'error');
      }
    } catch {
      addNotification('Lỗi kết nối server', 'error');
    }
  };

  const sortedCompanies = [...(companies || [])].sort((a, b) => b.budget - a.budget);
  const aliveCompanies = sortedCompanies.filter((c) => !c.bankrupt);
  const deadCompanies = sortedCompanies.filter((c) => c.bankrupt);

  const isEmployed = workerInfo?.companyId != null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🏢 Danh Sách Công Ty</h1>
        <div className="flex gap-3">
          {isEmployed && (
            <button onClick={handleQuit} className="btn-danger text-sm">
              Nghỉ việc
            </button>
          )}
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
            + Tạo công ty mới
          </button>
        </div>
      </div>

      {/* Worker status */}
      {workerInfo && (
        <div className={`glass-card p-4 border ${isEmployed ? 'border-green-500/20 stat-card-green' : 'border-amber-500/20 stat-card-amber'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{isEmployed ? '✅' : '😢'}</span>
            <span className="text-sm">
              {isEmployed
                ? `Bạn đang làm việc tại **${workerInfo.companyName}** — Lương: $${workerInfo.salary}`
                : 'Bạn đang thất nghiệp. Hãy gia nhập một công ty!'}
            </span>
          </div>
        </div>
      )}

      {/* Create Company Form */}
      {showCreate && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-bold mb-4">🏗️ Tạo Công Ty Mới</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tên công ty..."
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="input-dark flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCompany()}
            />
            <button
              onClick={handleCreateCompany}
              disabled={loading}
              className="btn-primary whitespace-nowrap"
            >
              {loading ? '⏳' : '🚀'} Tạo
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ngân sách khởi đầu: $1,000 • Tối đa 10 nhân viên • Lương mặc định: $15
          </p>
        </div>
      )}

      {/* Active Companies */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aliveCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            isMyCompany={workerInfo?.companyId === company.id}
            isOwner={user?.id === company.ownerId}
            canJoin={!isEmployed}
            onJoin={() => handleJoinCompany(company.id)}
          />
        ))}
      </div>

      {/* Bankrupt Companies */}
      {deadCompanies.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            💀 Công Ty Đã Phá Sản
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {deadCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isMyCompany={false}
                isOwner={false}
                canJoin={false}
                onJoin={() => {}}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CompanyCard({ company, isMyCompany, isOwner, canJoin, onJoin }: {
  company: any;
  isMyCompany: boolean;
  isOwner: boolean;
  canJoin: boolean;
  onJoin: () => void;
}) {
  const reputationColor = company.reputation >= 70 ? 'bg-green-500'
    : company.reputation >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={`glass-card p-5 ${isMyCompany ? 'border-green-500/30 stat-card-green' : ''} ${company.bankrupt ? 'border-red-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{company.name}</h3>
        {company.bankrupt && <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-lg">💀 Phá sản</span>}
        {isOwner && <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-lg">👑 CEO</span>}
        {isMyCompany && !isOwner && <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">✅ Đang làm</span>}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Ngân sách</span>
          <span className={`font-semibold ${Number(company.budget) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Number(company.budget).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Lương</span>
          <span className="font-semibold text-blue-400">${company.salaryPerWorker}/vòng</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Nhân viên</span>
          <span className="font-semibold">{company.currentWorkers}/{company.maxWorkers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Chủ sở hữu</span>
          <span className="font-semibold text-amber-400">{company.ownerName}</span>
        </div>
      </div>

      {/* Reputation bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Uy tín</span>
          <span className="text-gray-400">⭐ {company.reputation}/100</span>
        </div>
        <div className="reputation-bar">
          <div
            className={`reputation-fill ${reputationColor}`}
            style={{ width: `${company.reputation}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canJoin && !company.bankrupt && company.currentWorkers < company.maxWorkers && (
          <button onClick={onJoin} className="btn-primary text-sm flex-1">
            Gia nhập
          </button>
        )}
        <Link
          href={`/company/${company.id}`}
          className="btn-blue text-sm flex-1 text-center"
        >
          Chi tiết
        </Link>
      </div>
    </div>
  );
}
