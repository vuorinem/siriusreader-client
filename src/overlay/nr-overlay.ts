import { DialogService } from 'aurelia-dialog';
import { InactiveTimeout } from './inactive-timeout';
import { TrackingService } from '../tracking/tracking-service';
import { ApplicationState } from '../state/application-state';
import { autoinject, computedFrom } from 'aurelia-framework';

@autoinject
export class NrOverlay {
  @computedFrom(
    'applicationState.isReading',
    'applicationState.isLibrary',
    'applicationState.isActive',
    'applicationState.isFocused',
    'applicationState.isHidden',
    'applicationState.isMenuOpen',
    'dialogService.hasOpenDialog')
  private get isContentHidden(): boolean {
    if (!this.applicationState.isReading && !this.applicationState.isLibrary) {
      return false;
    }

    return !this.applicationState.isActive
      || !this.applicationState.isFocused
      || this.applicationState.isHidden
      || this.applicationState.isMenuOpen
      || this.dialogService.hasOpenDialog;
  }

  @computedFrom(
    'applicationState.isReading',
    'applicationState.isLibrary',
    'applicationState.isActive',
    'applicationState.isFocused',
    'applicationState.isHidden')
  private get isApplicationHidden(): boolean {
    if (!this.applicationState.isReading && !this.applicationState.isLibrary) {
      return false;
    }

    return !this.applicationState.isActive
      || !this.applicationState.isFocused
      || this.applicationState.isHidden
  }

  constructor(
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private inactiveTimeout: InactiveTimeout,
    private trackingService: TrackingService) { }

  private overlayClick() {
    if (this.applicationState.isMenuOpen) {
      this.trackingService.event('closeMenu');
      this.applicationState.isMenuOpen = false;
    }
  }
}
