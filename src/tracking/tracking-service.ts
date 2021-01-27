import { EventAggregator } from 'aurelia-event-aggregator';
import { ReconnectedEvent, TrackingConnectionService, ReconnectingEvent } from './tracking-connection-service';
import { TrackingCacheService } from './tracking-cache-service';
import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './../state/application-state';
import { BookService } from './../book/book-service';
import { AuthService } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import { ReadingState } from './../reading/reading-state';
import { ITrackingEvent } from './i-tracking-event';
import { EventType } from './event-type';

const SendDelayInMilliseconds = 500;
const StateCheckIntervalInSeconds = 5;
const HubMethodName = 'TrackEvents';
const EventCacheStorageKey = 'event-cache';

@autoinject
export class TrackingService {
  constructor(
    private eventAggregator: EventAggregator,
    private trackingCacheService: TrackingCacheService,
    private trackingConnectionService: TrackingConnectionService,
    private authService: AuthService,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private bookService: BookService,
    private readingState: ReadingState) {

    this.eventAggregator.subscribe(ReconnectedEvent, () => this.eventInternal('reconnected', true));
    this.eventAggregator.subscribe(ReconnectingEvent, () => this.eventInternal('reconnecting', false));

    window.setInterval(() => {
      this.scheduleSend(SendDelayInMilliseconds, false);
    }, StateCheckIntervalInSeconds * 1000);
  }

  public async event(type: EventType) {
    await this.eventInternal(type, true);
  }

  public eventImmediate(type: EventType) {
    this.eventInternal(type, false);
    this.send();
  }

  public async stop() {
    await this.scheduleSend(0);
    await this.trackingConnectionService.stop();
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

    this.trackingCacheService.addEventToCache(EventCacheStorageKey, event);

    if (send) {
      await this.scheduleSend();
    }
  }

  private async send() {
    await this.trackingConnectionService.send(HubMethodName, EventCacheStorageKey);
  }

  private async scheduleSend(delay: number = SendDelayInMilliseconds, resetIfAlreadyScheduled = true) {
    await this.trackingConnectionService.scheduleSend(delay, resetIfAlreadyScheduled, HubMethodName, EventCacheStorageKey);
  }

}
