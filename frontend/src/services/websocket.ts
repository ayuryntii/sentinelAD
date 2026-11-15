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

    // Start autonomous simulation quickly (after 1s) if WS cannot connect immediately
    const fallbackTimeout = setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.startAutonomousSimulation();
      }
    }, 1200);

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
          console.error('Failed to parse WS payload', err);
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
        this.ws?.close();
      };
    } catch {
      this.startAutonomousSimulation();
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  private startAutonomousSimulation() {
    if (this.isAutonomousActive) return;
    this.isAutonomousActive = true;
    this.notifyStatus(true); // Status shows ONLINE with autonomous engine

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
      this.ws.close();
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
