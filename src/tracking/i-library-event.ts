import { LibraryEventType } from './library-event-type';

export interface ILibraryEvent {
  time: Date;
  timezoneOffset: number;
  type: LibraryEventType;
  visibleBooks: number[],
  visibleSections: string[],
  windowWidth: number;
  windowHeight: number;
  isMenuOpen: boolean;
  isDialogOpen: boolean;
  isBlurred: boolean;
  isHidden: boolean;
  isInactive: boolean;
}
