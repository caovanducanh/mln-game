import { create } from 'zustand';
import { User, Company, GameState, EconomyStats, LeaderboardEntry, GameEvent, WorkerInfo, RoundTimer } from '@/types';

interface GameStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Worker
  workerInfo: WorkerInfo | null;
  setWorkerInfo: (info: WorkerInfo | null) => void;

  // Game state
  gameState: GameState | null;
  setGameState: (state: GameState) => void;

  // Economy
  economy: EconomyStats | null;
  setEconomy: (stats: EconomyStats) => void;

  // Companies
  companies: Company[];
  setCompanies: (companies: Company[]) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (entries: LeaderboardEntry[]) => void;

  // Events
  events: GameEvent[];
  addEvent: (event: GameEvent) => void;
  setEvents: (events: GameEvent[]) => void;

  // Round timer
  roundTimer: RoundTimer | null;
  setRoundTimer: (timer: RoundTimer) => void;

  // Notifications
  notifications: { id: number; message: string; type: 'success' | 'error' | 'info' }[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  workerInfo: null,
  setWorkerInfo: (workerInfo) => set({ workerInfo }),

  gameState: null,
  setGameState: (gameState) => set({
    gameState,
    economy: gameState.economy,
    companies: gameState.companies,
    leaderboard: gameState.leaderboard,
    events: gameState.activeEvents,
  }),

  economy: null,
  setEconomy: (economy) => set({ economy }),

  companies: [],
  setCompanies: (companies) => set({ companies }),

  leaderboard: [],
  setLeaderboard: (leaderboard) => set({ leaderboard }),

  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 20) })),
  setEvents: (events) => set({ events }),

  roundTimer: null,
  setRoundTimer: (roundTimer) => set({ roundTimer }),

  notifications: [],
  addNotification: (message, type) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), message, type }],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));
