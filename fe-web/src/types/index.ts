export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
}

export interface Company {
  id: number;
  name: string;
  budget: number;
  salaryPerWorker: number;
  productionCost: number;
  productPrice: number;
  reputation: number;
  maxWorkers: number;
  currentWorkers: number;
  ownerId: number;
  ownerName: string;
  bankrupt: boolean;
}

export interface WorkerInfo {
  id: number;
  userId: number;
  userName: string;
  companyId: number | null;
  companyName: string | null;
  salary: number | null;
}

export interface EconomyStats {
  gdp: number;
  avgSalary: number;
  unemploymentRate: number;
  totalWorkers: number;
  unemployedWorkers: number;
  totalCompanies: number;
  bankruptCompanies: number;
  totalProductsSold: number;
}

export interface LeaderboardEntry {
  rank: number;
  companyId: number;
  companyName: string;
  budget: number;
  reputation: number;
  workers: number;
}

export interface GameEvent {
  id: number;
  type: string;
  description: string;
  roundNumber: number;
  active: boolean;
}

export interface GameState {
  currentRound: number;
  roundStatus: string;
  roundTimeRemaining: number;
  economy: EconomyStats;
  companies: Company[];
  activeEvents: GameEvent[];
  leaderboard: LeaderboardEntry[];
}

export interface StrikeVote {
  id: number;
  companyId: number;
  companyName: string;
  votesFor: number;
  votesAgainst: number;
  totalWorkers: number;
  resolved: boolean;
  passed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface RoundTimer {
  round: number;
  status: string;
  timeRemaining: number;
}
