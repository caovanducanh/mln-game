import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

let stompClient: Client | null = null;

export function connectWebSocket(callbacks: {
  onEconomy?: (data: any) => void;
  onCompanies?: (data: any) => void;
  onEvents?: (data: any) => void;
  onLeaderboard?: (data: any) => void;
  onRoundTimer?: (data: any) => void;
}) {
  if (stompClient?.connected) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL) as any,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected');

      if (callbacks.onEconomy) {
        stompClient?.subscribe('/topic/economy', (msg) => {
          callbacks.onEconomy?.(JSON.parse(msg.body));
        });
      }
      if (callbacks.onCompanies) {
        stompClient?.subscribe('/topic/companies', (msg) => {
          callbacks.onCompanies?.(JSON.parse(msg.body));
        });
      }
      if (callbacks.onEvents) {
        stompClient?.subscribe('/topic/events', (msg) => {
          callbacks.onEvents?.(JSON.parse(msg.body));
        });
      }
      if (callbacks.onLeaderboard) {
        stompClient?.subscribe('/topic/leaderboard', (msg) => {
          callbacks.onLeaderboard?.(JSON.parse(msg.body));
        });
      }
      if (callbacks.onRoundTimer) {
        stompClient?.subscribe('/topic/round-timer', (msg) => {
          callbacks.onRoundTimer?.(JSON.parse(msg.body));
        });
      }
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  stompClient?.deactivate();
  stompClient = null;
}
