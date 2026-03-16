'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { api } from '@/lib/api';
import { Company } from '@/types';

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = Number(params.id);
  const { user, companies, addNotification } = useGameStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [newSalary, setNewSalary] = useState('');
  const [sabotageTarget, setSabotageTarget] = useState('');
  const [takeoverTarget, setTakeoverTarget] = useState('');

  useEffect(() => {
    loadCompany();
  }, [companyId, companies]);

  const loadCompany = async () => {
    const res = await api.getCompany(companyId);
    if (res.success) setCompany(res.data);
  };

  const isOwner = user?.id === company?.ownerId;
  const otherCompanies = companies?.filter((c) => c.id !== companyId && !c.bankrupt) || [];

  const handleSetSalary = async () => {
    const salary = parseFloat(newSalary);
    if (isNaN(salary) || salary < 0) { addNotification('Lương không hợp lệ', 'error'); return; }
    const res = await api.setSalary(companyId, salary);
    if (res.success) {
      addNotification(`Đã cập nhật lương: $${salary}`, 'success');
      loadCompany();
    } else {
      addNotification(res.message || 'Lỗi', 'error');
    }
  };

  const handleSabotage = async () => {
    if (!sabotageTarget) return;
    const res = await api.sabotage(companyId, parseInt(sabotageTarget));
    if (res.success) {
      addNotification(res.message || 'Phá hoại thành công!', 'success');
      loadCompany();
    } else {
      addNotification(res.message || 'Lỗi phá hoại', 'error');
    }
  };

  const handleTakeover = async () => {
    if (!takeoverTarget) return;
    const res = await api.takeover(companyId, parseInt(takeoverTarget));
    if (res.success) {
      addNotification(res.message || 'Thâu tóm thành công!', 'success');
      loadCompany();
    } else {
      addNotification(res.message || 'Lỗi thâu tóm', 'error');
    }
  };

  if (!company) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-gray-500">⏳ Đang tải...</div>;
  }

  const reputationColor = company.reputation >= 70 ? 'text-green-400'
    : company.reputation >= 40 ? 'text-amber-400' : 'text-red-400';
  const repBarColor = company.reputation >= 70 ? 'bg-green-500'
    : company.reputation >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {company.bankrupt ? '💀' : '🏢'} {company.name}
            </h1>
            <p className="text-gray-400 mt-1">CEO: {company.ownerName}</p>
          </div>
          {company.bankrupt && (
            <span className="text-lg text-red-400 bg-red-500/20 px-4 py-2 rounded-xl font-bold">
              ĐÃ PHÁ SẢN
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase">Ngân sách</p>
            <p className={`text-xl font-bold ${Number(company.budget) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Number(company.budget).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase">Lương</p>
            <p className="text-xl font-bold text-blue-400">${company.salaryPerWorker}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase">Nhân viên</p>
            <p className="text-xl font-bold">{company.currentWorkers}/{company.maxWorkers}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase">Uy tín</p>
            <p className={`text-xl font-bold ${reputationColor}`}>⭐ {company.reputation}</p>
          </div>
        </div>

        {/* Reputation bar */}
        <div className="mt-4">
          <div className="reputation-bar">
            <div className={`reputation-fill ${repBarColor}`} style={{ width: `${company.reputation}%` }} />
          </div>
        </div>

        {/* Economy info */}
        <div className="mt-4 p-4 rounded-xl bg-white/5">
          <p className="text-sm text-gray-400">
            💡 Chi phí sản xuất: ${company.productionCost}/sản phẩm • Giá bán: ${company.productPrice}/sản phẩm •
            Lợi nhuận/nhân viên/vòng: ${Number(company.productPrice) - Number(company.productionCost) - Number(company.salaryPerWorker)}
          </p>
        </div>
      </div>

      {/* CEO Actions */}
      {isOwner && !company.bankrupt && (
        <div className="space-y-4">
          {/* Set Salary */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">💵 Điều Chỉnh Lương</h3>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Lương mới..."
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                className="input-dark flex-1"
                min="0"
                step="1"
              />
              <button onClick={handleSetSalary} className="btn-primary">
                Cập nhật
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Lương thấp {'<'} $10 có thể bị đình công. Lương cao giúp tăng uy tín.
            </p>
          </div>

          {/* Sabotage */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 text-red-400">🔥 Phá Hoại Đối Thủ</h3>
            <div className="flex gap-3">
              <select
                value={sabotageTarget}
                onChange={(e) => setSabotageTarget(e.target.value)}
                className="input-dark flex-1"
              >
                <option value="">-- Chọn mục tiêu --</option>
                {otherCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${Number(c.budget).toLocaleString()})
                  </option>
                ))}
              </select>
              <button onClick={handleSabotage} className="btn-danger">
                Phá hoại!
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💰 Chi phí tăng dần: 30$ → 40$ → 50$... • 1 lần/vòng • Trừ ngân sách đối thủ cùng số tiền
            </p>
          </div>

          {/* Takeover */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-400">👑 Thâu Tóm Công Ty</h3>
            <div className="flex gap-3">
              <select
                value={takeoverTarget}
                onChange={(e) => setTakeoverTarget(e.target.value)}
                className="input-dark flex-1"
              >
                <option value="">-- Chọn mục tiêu --</option>
                {otherCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (cần ${(Number(c.budget) * 1.5).toLocaleString()})
                  </option>
                ))}
              </select>
              <button onClick={handleTakeover} className="btn-purple">
                Thâu tóm!
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚡ Cần ngân sách {'>'} 1.5× ngân sách đối thủ. Nhận toàn bộ nhân viên, đối thủ phá sản.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
