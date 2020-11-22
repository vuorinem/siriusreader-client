import { ApplicationState } from './../state/application-state';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { TrackingService } from './tracking-service';

@autoinject
export class WindowTrackingService {
  private onFocus = () => this.handleFocus(true);
  private onBlur = () => this.handleFocus(false);
  private onVisibilityChange = () => this.handleVisibilityChange()
  private onBeforeUnload = () => this.triggerEvent('close');

  constructor(
    private taskQueue: TaskQueue,
    private applicationState: ApplicationState,
    private trackingService: TrackingService) {
    this.attach();
  }

  public attach() {
    window.document.addEventListener('visibilitychange', this.onVisibilityChange, false);
    window.addEventListener('focus', this.onFocus, false);
    window.addEventListener('blur', this.onBlur, false);
    window.addEventListener('beforeunload', this.onBeforeUnload, false);
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
    this.taskQueue.queueTask(() => {
      this.applicationState.isFocused = isFocused;
      this.triggerEvent(isFocused ? 'focus' : 'blur');
    });
  }

  private handleVisibilityChange() {
    this.taskQueue.queueTask(() => {
      this.applicationState.isHidden = window.document.hidden;
      this.triggerEvent(this.applicationState.isHidden ? 'hide' : 'show');
    });
  }

  private triggerEvent(type: string) {
    this.trackingService.event(type);
  }

}
