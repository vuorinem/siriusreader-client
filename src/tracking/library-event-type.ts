import { ITitleDetails } from './../routes/library/i-title-details';

export type TitleDialogSections = keyof(ITitleDetails);

export type TitleDialogSectionActionTypes = 'Show' | 'Hide';

export type TitleDialogSectionActions = `${TitleDialogSections}${TitleDialogSectionActionTypes}`;

export type LibraryEventType =
  // Connection events
  'reconnected'
  | 'reconnecting'
  | 'login'
  | 'logout'

  // List events
  | 'openLibrary'
  | 'closeLibrary'
  | 'clickNext'
  | 'clickPrevious'
  | 'showTitles'

  // Dialog events
  | 'openDialog'
  | 'closeDialog'
  | TitleDialogSectionActions
  | 'clickSelectBook'
  | 'confirmSelectBook'
  | 'cancelSelectBook'

  // Browser events
  | 'pageNavigation'
  | 'resize'
  | 'focus'
  | 'blur'
  | 'hide'
  | 'show'
  | 'close'
  | 'inactiveTimeout'
  | 'clickActivate'
  ;
