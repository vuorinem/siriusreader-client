import { UserService } from './../user/user-service';
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

  private isDeadlinePassed: boolean = false;

  @computedFrom('applicationState.isMenuOpen')
  private get isOpen() {
    return this.applicationState.isMenuOpen;
  }

  private get timeUntilDeadline() {
    if (!this.deadline) {
      return;
    }

    const differenceInMilliseconds = this.deadline.getTime() - new Date().getTime();

    if (differenceInMilliseconds < 0) {
      this.isDeadlinePassed = true;
      return '';
    }

    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    if (differenceInDays > 0) {
      return differenceInDays + ' day' + (differenceInDays > 1 ? 's' : '');
    }

    const differenceInHours = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60));

    if (differenceInHours > 0) {
      return differenceInHours + ' hour' + (differenceInHours > 1 ? 's' : '');
    }

    const differenceInMinutes = Math.ceil(differenceInMilliseconds / (1000 * 60));

    return differenceInMinutes + ' minutes' + (differenceInMinutes > 1 ? 's' : '');
  }

  @computedFrom('userService.user')
  private get deadline(): Date | undefined {
    if (!this.userService.user) {
      return undefined;
    }

    return new Date(this.userService.user.deadline);
  }

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private authService: AuthService,
    private userService: UserService,
    private trackingService: TrackingService) {
  }

  private async openInformationSheet() {
    const dialog = this.dialogService.open({
      viewModel: InformationSheetDialog,
      overlayDismiss: true,
      lock: true,
    });

    await dialog;

    this.applicationState.isMenuOpen = false;

    this.trackingService.event('openInformation');

    await dialog.whenClosed();

    this.trackingService.event('closeInformation');
  }

  private async withdraw() {
    const dialog = this.dialogService.open({
      viewModel: WithdrawDialog,
      overlayDismiss: true,
      lock: true,
    });

    await dialog;

    this.applicationState.isMenuOpen = false;

    this.trackingService.event('openWithdrawal');

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
