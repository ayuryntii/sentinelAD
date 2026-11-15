import { TelemetryPayload } from '../types';

type MessageHandler = (data: TelemetryPayload) => void;
type StatusHandler = (connected: boolean) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectInterval = 2500;
  private isExplicitlyClosed = false;

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
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
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
        this.notifyStatus(false);
        if (!this.isExplicitlyClosed) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        this.notifyStatus(false);
        this.ws?.close();
      };
    } catch (err) {
      this.notifyStatus(false);
      setTimeout(() => this.connect(), this.reconnectInterval);
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
