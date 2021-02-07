import { EventType } from './../tracking/event-type';
import { LibraryEventType } from './../tracking/library-event-type';
import { TrackingService } from './../tracking/tracking-service';
import { ApplicationState } from './../state/application-state';
import { autoinject } from "aurelia-framework";
import { TimeoutService } from 'utility/timeout-service';

const InactiveTimeoutInMinutes = 0.1;

@autoinject
export class InactiveTimeout {
  private onActivity = (event: Event) => this.handleActivity(event);
  private onTimeout = async () => this.handleTimeout();

  constructor(
    private applicationState: ApplicationState,
    private timeoutService: TimeoutService,
    private trackingService: TrackingService) {

    this.start();
  }

  private start() {
    window.addEventListener('keydown', this.onActivity, false);
    window.addEventListener('wheel', this.onActivity, false);
    window.addEventListener('resize', this.onActivity, false);
    window.addEventListener('mousedown', this.onActivity, false);
    window.addEventListener('mouseup', this.onActivity, false);

    this.setInactiveTimeout();
  }

  private setInactiveTimeout() {
    this.timeoutService.debounce('inactive', InactiveTimeoutInMinutes * 60 * 1000, this.onTimeout);
  }

  private handleActivity(event: Event) {
    this.setInactiveTimeout();

    if (this.applicationState.isActive) {
      return;
    }

    this.applicationState.isActive = true;

    this.triggerEvent('clickActivate');
  }

  private handleTimeout() {
    if (!this.applicationState.isReading && !this.applicationState.isLibrary) {
      this.setInactiveTimeout();
      return;
    }

    if (!this.applicationState.isActive) {
      return;
    }

    this.applicationState.isActive = false;

    this.triggerEvent('inactiveTimeout');
  }

  private triggerEvent(type: EventType & LibraryEventType) {
    this.trackingService.event(type);
    this.trackingService.libraryEvent(type);
  }
}
