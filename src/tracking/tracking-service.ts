import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './../state/application-state';
import { HttpClient } from 'aurelia-fetch-client';
import { BookService } from './../book/book-service';
import { AuthService } from '../auth/auth-service';
import { autoinject } from 'aurelia-framework';
import { ReadingState } from './../reading/reading-state';
import { json } from 'aurelia-fetch-client';
import { ITrackingEvent } from './i-tracking-event';

@autoinject
export class TrackingService {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private bookService: BookService,
    private readingState: ReadingState) {
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
    await this.http.fetch('/tracking/event', {
      body: json(event),
      method: 'post',
    });
  }

}
