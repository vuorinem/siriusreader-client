import { EventAggregator } from 'aurelia-event-aggregator';
import { AuthService } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import * as signalR from "@microsoft/signalr";
import { TrackingCacheService, EventCacheKey } from './tracking-cache-service';
import { SiriusConfig } from 'config/sirius-config';

const ConnectionCheckIntervalInSeconds = 5;
const ConnectionRetryInSeconds = 5;
const MaxRetryTimeout = 20;

export type MethodName = 'TrackEvents' | 'TrackLibraryEvents';

export const ReconnectedEvent = 'tracking-connection-service-reconnected';
export const ReconnectingEvent = 'tracking-connection-service-reconnecting';

@autoinject
export class TrackingConnectionService {
  public hasConnectionProblem = false;

  private connection: signalR.HubConnection;

  private retryTimeouts: { [key: string]: number | undefined } = {};
  private retryTimeoutsSeconds: { [key: string]: number | undefined } = {};

  constructor(
    private eventAggregator: EventAggregator,
    private authService: AuthService,
    private trackingCacheService: TrackingCacheService) {

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SiriusConfig.apiUrl + '/hubs/tracking', {
        logger: SiriusConfig.debug ? signalR.LogLevel.Information : signalR.LogLevel.Error,
      })
      .build();

    this.connection.keepAliveIntervalInMilliseconds = ConnectionCheckIntervalInSeconds * 1000;

    this.connection.onreconnected(() => this.eventAggregator.publish(ReconnectedEvent));
    this.connection.onreconnecting(() => this.eventAggregator.publish(ReconnectingEvent));
  }

  public async connect() {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
      this.hasConnectionProblem = false;
    }
  }

  public async stop() {
    await this.connection.stop();
    this.hasConnectionProblem = false;
  }

  public async send(methodName: MethodName, cacheKey: EventCacheKey): Promise<boolean> {
    if (!this.authService.isAuthenticated) {
      return false;
    }

    const eventsToSend = this.trackingCacheService.getCache(cacheKey);

    if (eventsToSend.length === 0) {
      return true;
    }

    try {
      await this.connect();
      await this.connection.send(methodName, eventsToSend);
      this.trackingCacheService.clearCache(cacheKey);
      this.retryTimeoutsSeconds[cacheKey] = undefined;
      return true;
    } catch {
      // Schedule a retry unless we already tried too many times
      this.hasConnectionProblem = true;
      const timeout = (this.retryTimeoutsSeconds[cacheKey] ?? 0) + 3;
      this.retryTimeoutsSeconds[cacheKey] = timeout;
      if (timeout < MaxRetryTimeout) {
        return await this.scheduleSend(timeout * 1000, true, methodName, cacheKey);
      } else {
        // Disconnect and try to reconnect
        await this.connection.stop();
        return await this.scheduleSend(ConnectionRetryInSeconds * 1000, true, methodName, cacheKey);
      }
    }
  }

  public async scheduleSend(timeout: number, resetIfAlreadyScheduled: boolean, methodName: MethodName, cacheKey: EventCacheKey): Promise<boolean> {
    if (this.retryTimeouts[cacheKey]) {
      if (!resetIfAlreadyScheduled) {
        return false;
      }

      window.clearTimeout(this.retryTimeouts[cacheKey]);
      this.retryTimeouts[cacheKey] = undefined;
    }

    return new Promise<boolean>(async resolve => {
      this.retryTimeouts[cacheKey] = window.setTimeout(async () => {
        this.retryTimeouts[cacheKey] = undefined;
        resolve(await this.send(methodName, cacheKey));
      }, timeout);
    });
  }

}
