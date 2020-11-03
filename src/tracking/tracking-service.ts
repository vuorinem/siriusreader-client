import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './../state/application-state';
import { BookService } from './../book/book-service';
import { AuthService, EventLogin, EventLogout } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import { ReadingState } from './../reading/reading-state';
import { ITrackingEvent } from './i-tracking-event';
import * as signalR from "@microsoft/signalr";
import { EventAggregator } from 'aurelia-event-aggregator';
import * as environment from '../../config/environment.json';

const apiUrl = process.env.apiUrl || environment.apiUrl;

const InitialRetryTimeoutInSeconds = 1;
const MaxRetryTimeout = 20;

@autoinject
export class TrackingService {
  private connection: signalR.HubConnection;
  private eventCache: ITrackingEvent[] = [];

  private retryTimeout?: number;
  private retryTimeoutSeconds: number = InitialRetryTimeoutInSeconds;

  constructor(
    private authService: AuthService,
    private eventAggregator: EventAggregator,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private bookService: BookService,
    private readingState: ReadingState) {

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl + '/hubs/tracking', {
        accessTokenFactory: () => {
          // TODO: Check that the token has not expired
          return this.authService.token;
        },
      })
      .build();

    this.eventAggregator.subscribe(EventLogin, () => this.connect());
    this.eventAggregator.subscribe(EventLogout, () => this.disconnect());
  }

  public async event(type: string) {
    await this.eventInternal(type);
  }

  private async eventInternal(type: string) {
    if (!this.authService.isAuthenticated) {
      return;
    }

    if (!this.bookService.book) {
      return;
    }

    const time = new Date();

    await this.send({
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
      isInactive: !this.applicationState.isActive,
      isReading: this.applicationState.isReading,
    });
  }

  private async send(event: ITrackingEvent) {
    this.eventCache.push(event);

    await this.sendCached();
  }

  private async sendCached() {
    const eventsToSend = this.eventCache;
    this.eventCache = [];

    try {
      await this.connect();
      await this.connection.send('TrackEvents', eventsToSend);
      this.retryTimeoutSeconds = InitialRetryTimeoutInSeconds;
    } catch {
      // Sending events failed, push back to cache
      this.eventCache.push(...eventsToSend);

      // Schedule a retry unless we already tried too many times
      this.retryTimeoutSeconds = this.retryTimeoutSeconds + 2;
      if (this.retryTimeoutSeconds < MaxRetryTimeout) {
        await this.scheduleSend(this.retryTimeoutSeconds * 1000);
      } else {
        throw new Error('Error in tracking service');
      }
    }
  }

  private async scheduleSend(timeout: number) {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }

    return new Promise<void>(async resolve => {
      this.retryTimeout = window.setTimeout(async () => {
        await this.sendCached();
        resolve();
      }, timeout);
    });
  }

  private async connect() {
    // TODO: check if connection has broken down?

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  private async disconnect() {
    if (this.eventCache.length > 0) {
      await this.sendCached();
    }

    await this.connection.stop();
  }

}
