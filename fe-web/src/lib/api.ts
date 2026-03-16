import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

export const api = {
  // Auth
  getMe: () => fetchApi<any>('/api/me'),
  getMyWorker: () => fetchApi<any>('/api/me/worker'),

  // Companies
  getCompanies: () => fetchApi<any>('/api/companies'),
  getCompany: (id: number) => fetchApi<any>(`/api/company/${id}`),
  createCompany: (name: string) => fetchApi<any>('/api/company', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  setSalary: (companyId: number, salary: number) => fetchApi<any>(`/api/company/${companyId}/salary`, {
    method: 'POST',
    body: JSON.stringify({ salary }),
  }),
  sabotage: (companyId: number, targetCompanyId: number) => fetchApi<any>(`/api/company/${companyId}/sabotage`, {
    method: 'POST',
    body: JSON.stringify({ targetCompanyId }),
  }),
  takeover: (companyId: number, targetCompanyId: number) => fetchApi<any>(`/api/company/${companyId}/takeover`, {
    method: 'POST',
    body: JSON.stringify({ targetCompanyId }),
  }),

  // Workers
  joinCompany: (companyId: number) => fetchApi<any>(`/api/worker/join/${companyId}`, { method: 'POST' }),
  quitCompany: () => fetchApi<any>('/api/worker/quit', { method: 'POST' }),
  initiateStrike: (companyId: number) => fetchApi<any>(`/api/worker/strike/${companyId}`, { method: 'POST' }),
  castStrikeVote: (companyId: number, voteFor: boolean) =>
    fetchApi<any>(`/api/worker/strike/${companyId}/vote?voteFor=${voteFor}`, { method: 'POST' }),
  createUnion: (companyId: number, name: string, demandedSalary: number) =>
    fetchApi<any>(`/api/worker/union/${companyId}`, {
      method: 'POST',
      body: JSON.stringify({ name, demandedSalary }),
    }),

  // Game
  getGameState: () => fetchApi<any>('/api/game/state'),
  getLeaderboard: () => fetchApi<any>('/api/game/leaderboard'),
  startGame: () => fetchApi<any>('/api/game/start', { method: 'POST' }),
  nextRound: () => fetchApi<any>('/api/game/next-round', { method: 'POST' }),

  // Events (admin)
  triggerEvent: (type: string, description?: string, targetCompanyId?: number) =>
    fetchApi<any>('/api/events/trigger', {
      method: 'POST',
      body: JSON.stringify({ type, description, targetCompanyId }),
    }),
};
