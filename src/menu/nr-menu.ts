import { Router } from 'aurelia-router';
import { InformationSheetDialog } from './../information-sheet/information-sheet-dialog';
import { DialogService } from 'aurelia-dialog';
import { TrackingService } from './../tracking/tracking-service';
import { autoinject, bindable, observable } from 'aurelia-framework';
import { AuthService } from '../auth/auth-service';
import { WithdrawDialog } from '../withdrawal/withdraw-dialog';

@autoinject
export class NrMenu {

  @observable private isOpen: boolean = false;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private authService: AuthService,
    private trackingService: TrackingService) {
  }

  private async openInformationSheet() {
    await this.dialogService.open({
      viewModel: InformationSheetDialog,
      overlayDismiss: true,
      lock: true,
    }).whenClosed();

    this.isOpen = false;
  }

  private async withdraw() {
    const dialogResult = await this.dialogService.open({
      viewModel: WithdrawDialog,
      overlayDismiss: true,
      lock: true,
    }).whenClosed();

    if (dialogResult.wasCancelled) {
      return;
    }

    this.router.navigateToRoute("logout");
  }

  private isOpenChanged(newValue?: boolean, oldValue?: boolean) {
    if (oldValue === undefined) {
      return;
    }

    if (this.isOpen) {
      this.trackingService.event('openMenu');
    } else {
      this.trackingService.event('closeMenu');
    }
  }

}
