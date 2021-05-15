import { EventType } from './event-type';

export interface ITrackingEvent {
  bookId: number;
  time: Date;
  timezoneOffset: number;
  type: EventType;
  startLocation: number;
  visibleCharacterCount: number;
  visibleWordCount: number;
  windowWidth: number;
  windowHeight: number;
  pageInSection: number;
  totalPagesInSection: number;
  isMenuOpen: boolean;
  isDialogOpen: boolean;
  isHighlightMenuOpen: boolean;
  isBlurred: boolean;
  isHidden: boolean;
  isInactive: boolean;
  isReading: boolean;
}
