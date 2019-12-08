import { ApplicationState } from './../state/application-state';
import { Router } from 'aurelia-router';
import { InformationSheetDialog } from './../information-sheet/information-sheet-dialog';
import { DialogService } from 'aurelia-dialog';
import { TrackingService } from './../tracking/tracking-service';
import { autoinject, computedFrom } from 'aurelia-framework';
import { AuthService } from '../auth/auth-service';
import { WithdrawDialog } from '../withdrawal/withdraw-dialog';

@autoinject
export class NrMenu {

  @computedFrom('applicationState.isMenuOpen')
  private get isOpen() {
    return this.applicationState.isMenuOpen;
  }

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private authService: AuthService,
    private trackingService: TrackingService) {
  }

  private async openInformationSheet() {
    this.trackingService.event('openInformation');

    const dialog = this.dialogService.open({
      viewModel: InformationSheetDialog,
      overlayDismiss: true,
      lock: true,
    });

    await dialog;

    this.applicationState.isMenuOpen = false;

    await dialog.whenClosed();

    this.trackingService.event('closeInformation');
  }

  private async withdraw() {
    this.trackingService.event('openWithdrawal');

    const dialog = this.dialogService.open({
      viewModel: WithdrawDialog,
      overlayDismiss: true,
      lock: true,
    });

    await dialog;

    this.applicationState.isMenuOpen = false;

    const dialogResult = await dialog.whenClosed();

    if (dialogResult.wasCancelled) {
      this.trackingService.event('closeWithdrawal');
      return;
    }

    this.authService.logout();
    this.router.navigateToRoute("login");
  }

  private toggleMenu() {
    this.applicationState.isMenuOpen = !this.applicationState.isMenuOpen;

    if (this.applicationState.isMenuOpen) {
      this.trackingService.event('openMenu');
    } else {
      this.trackingService.event('closeMenu');
    }
  }

}
