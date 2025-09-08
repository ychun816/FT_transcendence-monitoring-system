import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: promClient.Registry;

  // HTTP Metrics
  private httpRequestsTotal: promClient.Counter<string>;
  private httpRequestDuration: promClient.Histogram<string>;

  // Game-specific Metrics
  private activeGamesGauge: promClient.Gauge<string>;
  private gamesCompletedTotal: promClient.Counter<string>;
  private playersOnlineGauge: promClient.Gauge<string>;
  private authAttemptsTotal: promClient.Counter<string>;

  constructor() {
    this.register = new promClient.Registry();
    
    // Collect default system metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.register });

    // HTTP Request Counter
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    // Game Metrics
    this.activeGamesGauge = new promClient.Gauge({
      name: 'pong_active_games',
      help: 'Number of active Pong games',
      registers: [this.register],
    });

    this.gamesCompletedTotal = new promClient.Counter({
      name: 'pong_games_completed_total',
      help: 'Total number of completed Pong games',
      labelNames: ['game_mode'],
      registers: [this.register],
    });

    this.playersOnlineGauge = new promClient.Gauge({
      name: 'pong_players_online',
      help: 'Number of players currently online',
      registers: [this.register],
    });

    this.authAttemptsTotal = new promClient.Counter({
      name: 'auth_attempts_total',
      help: 'Total authentication attempts',
      labelNames: ['status', 'method'],
      registers: [this.register],
    });
  }

  // HTTP Metrics Methods
  incrementHttpRequests(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
  }

  recordHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // Game Metrics Methods
  setActiveGames(count: number) {
    this.activeGamesGauge.set(count);
  }

  incrementGamesCompleted(gameMode: string = 'standard') {
    this.gamesCompletedTotal.inc({ game_mode: gameMode });
  }

  setPlayersOnline(count: number) {
    this.playersOnlineGauge.set(count);
  }

  incrementAuthAttempts(status: 'success' | 'failure', method: 'login' | 'register' | '42auth') {
    this.authAttemptsTotal.inc({ status, method });
  }

  // Export metrics for Prometheus
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
