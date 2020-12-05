import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './../state/application-state';
import { BookService } from './../book/book-service';
import { AuthService } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import { ReadingState } from './../reading/reading-state';
import { ITrackingEvent } from './i-tracking-event';
import * as signalR from "@microsoft/signalr";
import * as environment from '../../config/environment.json';
import { EventType } from './event-type';

const apiUrl = process.env.apiUrl || environment.apiUrl;

const SendDelayInMilliseconds = 500;
const StateCheckIntervalInSeconds = 5;
const ConnectionCheckIntervalInSeconds = 5;
const InitialRetryTimeoutInSeconds = 1;
const ConnectionRetryInSeconds = 5;
const MaxRetryTimeout = 20;

const EventCacheStorageKey = 'event-cache';

@autoinject
export class TrackingService {
  public hasConnectionProblem = false;

  private connection: signalR.HubConnection;
  private eventCache: ITrackingEvent[] = [];
  private useInMemoryCache = false;

  private retryTimeout?: number;
  private retryTimeoutSeconds: number = InitialRetryTimeoutInSeconds;

  constructor(
    private authService: AuthService,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private bookService: BookService,
    private readingState: ReadingState) {

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl + '/hubs/tracking', {
        accessTokenFactory: async () => {
          return await this.authService.getToken() ?? '';
        },
        logger: environment.debug ? signalR.LogLevel.Information : signalR.LogLevel.Error,
      })
      .build();

    this.connection.keepAliveIntervalInMilliseconds = ConnectionCheckIntervalInSeconds * 1000;

    this.connection.onreconnected(() => this.eventInternal('reconnected', true));
    this.connection.onreconnecting(() => this.eventInternal('reconnecting', false));

    window.setInterval(() => {
      this.scheduleSend(SendDelayInMilliseconds, false);
    }, StateCheckIntervalInSeconds * 1000);
  }

  public async event(type: EventType) {
    await this.eventInternal(type, true);
  }

  public eventImmediate(type: EventType) {
    this.eventInternal(type, false);
    this.sendCached();
  }

  public async stop() {
    await this.scheduleSend(0);
    await this.disconnect();
    this.hasConnectionProblem = false;
  }

  private async eventInternal(type: EventType, send: boolean) {
    if (!this.authService.isAuthenticated) {
      return;
    }

    if (!this.bookService.book) {
      return;
    }

    const time = new Date();

    const event: ITrackingEvent = {
      bookId: this.bookService.book.bookId,
      time: time,
      timezoneOffset: time.getTimezoneOffset(),
      type: type,
      startLocation: this.readingState.startLocation,
      visibleCharacterCount: this.readingState.characterCount,
      visibleWordCount: this.readingState.wordCount,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pageInSection: this.readingState.currentPage,
      totalPagesInSection: this.readingState.sectionPageCount,
      isMenuOpen: this.applicationState.isMenuOpen,
      isDialogOpen: this.dialogService.hasOpenDialog,
      isBlurred: !this.applicationState.isFocused,
      isHidden: this.applicationState.isHidden,
      isInactive: !this.applicationState.isActive,
      isReading: this.applicationState.isReading,
    };

    this.addEventToCache(event);

    if (send) {
      await this.scheduleSend(SendDelayInMilliseconds);
    }
  }

  private async sendCached() {
    if (!this.authService.isAuthenticated) {
      return;
    }

    const eventsToSend = this.getCache();

    if (eventsToSend.length === 0) {
      return;
    }

    try {
      await this.connect();
      await this.connection.send('TrackEvents', eventsToSend);
      this.clearCache();
      this.retryTimeoutSeconds = InitialRetryTimeoutInSeconds;
    } catch {
      // Schedule a retry unless we already tried too many times
      this.hasConnectionProblem = true;
      this.retryTimeoutSeconds = this.retryTimeoutSeconds + 2;
      if (this.retryTimeoutSeconds < MaxRetryTimeout) {
        await this.scheduleSend(this.retryTimeoutSeconds * 1000);
      } else {
        // Disconnect and try to reconnect
        await this.disconnect();
        await this.scheduleSend(ConnectionRetryInSeconds * 1000);
      }
    }
  }

  private async scheduleSend(timeout: number, resetIfAlreadyScheduled = true) {
    if (this.retryTimeout) {
      if (!resetIfAlreadyScheduled) {
        return;
      }

      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }

    return new Promise<void>(async resolve => {
      this.retryTimeout = window.setTimeout(async () => {
        this.retryTimeout = undefined;
        await this.sendCached();
        resolve();
      }, timeout);
    });
  }

  private async connect() {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
      this.hasConnectionProblem = false;
    }
  }

  private async disconnect() {
    await this.connection.stop();
  }

  private addEventToCache(event: ITrackingEvent) {
    const cache = this.getCache();

    cache.push(event);

    if (this.useInMemoryCache) {
      this.eventCache = cache;
    } else {
      try {
        window.localStorage.setItem(EventCacheStorageKey, JSON.stringify(cache));
      } catch (error) {
        this.useInMemoryCache = true;
        this.eventCache = cache;
      }
    }
  }

  private clearCache() {
    if (this.useInMemoryCache) {
      this.eventCache = [];
    } else {
      try {
        window.localStorage.setItem(EventCacheStorageKey, JSON.stringify([]));
      } catch (error) {
        this.useInMemoryCache = true;
        this.eventCache = [];
      }
    }
  }

  private getCache(): ITrackingEvent[] {
    if (this.useInMemoryCache) {
      return this.eventCache;
    }

    try {
      const storageItem = window.localStorage.getItem(EventCacheStorageKey);

      if (storageItem === null) {
        return [];
      }

      return JSON.parse(storageItem);
    } catch (error) {
      this.useInMemoryCache = true;
      return this.eventCache;
    }
  }

}
