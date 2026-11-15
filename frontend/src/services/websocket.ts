import { TelemetryPayload } from '../types';
import { autonomousEngine } from './autonomousEngine';

type MessageHandler = (data: TelemetryPayload) => void;
type StatusHandler = (connected: boolean) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectInterval = 4000;
  private isExplicitlyClosed = false;
  private autonomousTimer: any = null;
  private isAutonomousActive = false;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsHost = window.location.host;
    if (window.location.port === '3000') {
      wsHost = `${window.location.hostname || 'localhost'}:8000`;
    }
    this.url = `${protocol}//${wsHost}/api/v1/ws/traffic`;
  }

  public connect() {
    this.isExplicitlyClosed = false;

    // Check if running on Vercel or cloud static hosting without backend WebSocket
    const isStandaloneCloud = typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('pages.dev')
    );

    if (isStandaloneCloud) {
      this.startAutonomousSimulation();
      return;
    }

    // Start autonomous simulation after 1.5s if WS cannot connect
    const fallbackTimeout = setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.startAutonomousSimulation();
      }
    }, 1500);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        clearTimeout(fallbackTimeout);
        this.stopAutonomousSimulation();
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: TelemetryPayload = JSON.parse(event.data);
          this.notifyMessage(data);
        } catch (err) {
          console.error('Gagal parsing pesan WebSocket', err);
        }
      };

      this.ws.onclose = () => {
        if (!this.isExplicitlyClosed) {
          this.startAutonomousSimulation();
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = () => {
        this.startAutonomousSimulation();
        try {
          this.ws?.close();
        } catch {
          // Abaikan
        }
      };
    } catch {
      this.startAutonomousSimulation();
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  private startAutonomousSimulation() {
    if (this.isAutonomousActive) return;
    this.isAutonomousActive = true;
    this.notifyStatus(true); // Status shows ONLINE with autonomous telemetry

    if (this.autonomousTimer) clearInterval(this.autonomousTimer);
    // Send immediate initial payload
    const initial = autonomousEngine.getNextTelemetry();
    this.notifyMessage(initial);

    this.autonomousTimer = setInterval(() => {
      const data = autonomousEngine.getNextTelemetry();
      this.notifyMessage(data);
    }, 1000);
  }

  private stopAutonomousSimulation() {
    this.isAutonomousActive = false;
    if (this.autonomousTimer) {
      clearInterval(this.autonomousTimer);
      this.autonomousTimer = null;
    }
  }

  public subscribe(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public subscribeStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  public send(payload: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  public close() {
    this.isExplicitlyClosed = true;
    this.stopAutonomousSimulation();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Abaikan
      }
    }
  }

  private notifyMessage(data: TelemetryPayload) {
    this.messageHandlers.forEach((handler) => handler(data));
  }

  private notifyStatus(status: boolean) {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

export const wsClient = new WebSocketClient();
