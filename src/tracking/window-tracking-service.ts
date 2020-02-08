import { ApplicationState } from './../state/application-state';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { TrackingService } from './tracking-service';

@autoinject
export class WindowTrackingService {
  private onFocus: () => void = () => this.handleFocus(true);
  private onBlur: () => void = () => this.handleFocus(false);
  private onBeforeUnload: () => void = () => this.triggerEvent('close');

  constructor(
    private taskQueue: TaskQueue,
    private applicationState: ApplicationState,
    private trackingService: TrackingService) {
    this.attach();
  }

  public attach() {
    window.addEventListener('focus', this.onFocus, false);
    window.addEventListener('blur', this.onBlur, false);
    window.addEventListener('beforeunload', this.onBeforeUnload, false);
  }

  public detach() {
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

  private triggerEvent(type: string) {
    this.trackingService.event(type);
  }

}
