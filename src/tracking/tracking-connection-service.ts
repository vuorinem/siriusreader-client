import { ITrackingEvent } from './i-tracking-event';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AuthService } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import * as signalR from "@microsoft/signalr";
import * as environment from '../../config/environment.json';
import { TrackingCacheService } from './tracking-cache-service';
import { throws } from 'assert';

const apiUrl = process.env.apiUrl || environment.apiUrl;

const ConnectionCheckIntervalInSeconds = 5;
const InitialRetryTimeoutInSeconds = 1;
const ConnectionRetryInSeconds = 5;
const MaxRetryTimeout = 20;

export const ReconnectedEvent = 'tracking-connection-service-reconnected';
export const ReconnectingEvent = 'tracking-connection-service-reconnecting';

type AnyEvent = ITrackingEvent;

@autoinject
export class TrackingConnectionService {
  public hasConnectionProblem = false;

  private connection: signalR.HubConnection;

  private retryTimeout?: number;
  private retryTimeoutSeconds: number = InitialRetryTimeoutInSeconds;

  constructor(
    private eventAggregator: EventAggregator,
    private authService: AuthService,
    private trackingCacheService: TrackingCacheService) {

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl + '/hubs/tracking', {
        accessTokenFactory: async () => {
          return await this.authService.getToken() ?? '';
        },
        logger: environment.debug ? signalR.LogLevel.Information : signalR.LogLevel.Error,
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

  public async send(methodName: string, cacheKey: string): Promise<boolean> {
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
      this.retryTimeoutSeconds = InitialRetryTimeoutInSeconds;
      return true;
    } catch {
      // Schedule a retry unless we already tried too many times
      this.hasConnectionProblem = true;
      this.retryTimeoutSeconds = this.retryTimeoutSeconds + 2;
      if (this.retryTimeoutSeconds < MaxRetryTimeout) {
        return await this.scheduleSend(this.retryTimeoutSeconds * 1000, true, methodName, cacheKey);
      } else {
        // Disconnect and try to reconnect
        await this.connection.stop();
        return await this.scheduleSend(ConnectionRetryInSeconds * 1000, true, methodName, cacheKey);
      }
    }
  }

  public async scheduleSend(timeout: number, resetIfAlreadyScheduled: boolean, methodName: string, cacheKey: string): Promise<boolean> {
    if (this.retryTimeout) {
      if (!resetIfAlreadyScheduled) {
        return false;
      }

      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }

    return new Promise<boolean>(async resolve => {
      this.retryTimeout = window.setTimeout(async () => {
        this.retryTimeout = undefined;
        resolve(await this.send(methodName, cacheKey));
      }, timeout);
    });
  }

}
