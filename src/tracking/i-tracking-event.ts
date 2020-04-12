export interface ITrackingEvent {
  bookId: number;
  time: Date;
  timezoneOffset: number;
  type: string;
  startLocation: number;
  visibleCharacterCount: number;
  visibleWordCount: number;
  windowWidth: number;
  windowHeight: number;
  pageInSection: number;
  totalPagesInSection: number;
  isMenuOpen: boolean;
  isDialogOpen: boolean;
  isBlurred: boolean;
  isInactive: boolean;
  isReading: boolean;
}
