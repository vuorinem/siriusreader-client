import { TimeoutService } from './../utility/timeout-service';
import { EventType } from './event-type';
import { ApplicationState } from './../state/application-state';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { TrackingService } from './tracking-service';
import { LibraryEventType } from './library-event-type';

@autoinject
export class WindowTrackingService {
  private onFocus = () => this.handleFocus(true);
  private onBlur = () => this.handleFocus(false);
  private onVisibilityChange = () => this.handleVisibilityChange()
  private onBeforeUnload = () => this.trackingService.eventImmediate('close');

  constructor(
    private taskQueue: TaskQueue,
    private applicationState: ApplicationState,
    private trackingService: TrackingService,
    private timeoutService: TimeoutService) {
  }

  public attach() {
    window.document.addEventListener('visibilitychange', this.onVisibilityChange, false);
    window.addEventListener('focus', this.onFocus, false);
    window.addEventListener('blur', this.onBlur, false);
    window.addEventListener('beforeunload', this.onBeforeUnload, false);

    this.handleFocus(window.document.hasFocus());
    this.handleVisibilityChange();
  }

  public detach() {
    window.document.removeEventListener('visibilitychange', this.onVisibilityChange, false);
    window.removeEventListener('focus', this.onFocus, false);
    window.removeEventListener('blur', this.onBlur, false);
    window.removeEventListener('beforeunload', this.onBeforeUnload, false);
  }

  private handleFocus(isFocused: boolean) {
    // Set isFocused only after handling task queue so that initial click handlers
    // see the non-focused state
    this.timeoutService.debounce('handleFocus', 50, () => {
      this.applicationState.isFocused = isFocused;
      this.triggerEvent(isFocused ? 'focus' : 'blur');
    });
  }

  private handleVisibilityChange() {
    this.timeoutService.debounce('handleVisibilityChange', 50, () => {
      if (this.applicationState.isHidden === window.document.hidden) {
        return;
      }
      
      this.applicationState.isHidden = window.document.hidden;
      this.triggerEvent(this.applicationState.isHidden ? 'hide' : 'show');
    });
  }

  private triggerEvent(type: EventType & LibraryEventType) {
    this.trackingService.event(type);
    this.trackingService.libraryEvent(type);
  }

}
