export type NavigationEventSource =
  'click'
  | 'wheel'
  | 'swipe'
  | 'touch'
  | 'keyboard'
  ;

export type NavigationEventDirection = 'Backward' | 'Forward';

export type NavigationEventType = `${NavigationEventSource}${NavigationEventDirection}`;

export type EventType =
  // Connection events
  'reconnected'
  | 'reconnecting'
  | 'login'
  | 'logout'

  // Menu events
  | 'openMenu'
  | 'closeMenu'
  | 'openInformation'
  | 'closeInformation'
  | 'openWithdrawal'
  | 'closeWithdrawal'

  // Reading events
  | 'openBook'
  | 'openPage'
  | 'bookDialogOpen'
  | 'bookDialogClose'
  | 'inactiveTimeout'
  | NavigationEventType
  | 'progressBarJump'
  | 'swipeUp'
  | 'swipeDown'

  // Annotation events
  | 'newSelection'
  | 'openSelection'
  | 'closeSelection'
  | 'highlightAdd'
  | 'highlightRemove'
  | 'underlineAdd'
  | 'underlineRemove'
  | 'annotationAdd'
  | 'annotationRemove'

  // Browser events
  | 'pageNavigation'
  | 'resize'
  | 'focus'
  | 'blur'
  | 'hide'
  | 'show'
  | 'close'
  ;
