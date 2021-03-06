import { HttpClient } from 'aurelia-fetch-client';
import { SiriusConfig } from './../config/sirius-config';
import { InfographicDialog } from './../infographics/infographic-dialog';
import { InfographicService } from './../infographics/infographic-service';
import { ApplicationState } from './../state/application-state';
import { Router } from 'aurelia-router';
import { InformationSheetDialog } from './../information-sheet/information-sheet-dialog';
import { DialogService } from 'aurelia-dialog';
import { TrackingService } from './../tracking/tracking-service';
import { autoinject, computedFrom } from 'aurelia-framework';
import { AuthService } from '../auth/auth-service';
import { WithdrawDialog } from '../withdrawal/withdraw-dialog';
import { TrackingConnectionService } from 'tracking/tracking-connection-service';

@autoinject
export class NrMenu {

  @computedFrom('applicationState.isMenuOpen')
  private get isOpen() {
    return this.applicationState.isMenuOpen;
  }

  @computedFrom('trackingConnectionService.hasConnectionProblem')
  private get hasConnectionProblem() {
    return this.trackingConnectionService.hasConnectionProblem;
  }

  @computedFrom('infographicService.isInfographicReady')
  private get isInfographicReady() {
    return this.infographicService.isInfographicReady;
  }

  @computedFrom('infographicService.totalEngagedReadingMinutes')
  private get readSeconds() {
    return Math.floor(this.infographicService.totalEngagedReadingMinutes * 60 % 60)
  }

  @computedFrom('infographicService.totalEngagedReadingMinutes')
  private get readMinutes() {
    return Math.floor(this.infographicService.totalEngagedReadingMinutes);
  }

  private showReadingTime = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private authService: AuthService,
    private trackingService: TrackingService,
    private trackingConnectionService: TrackingConnectionService,
    private infographicService: InfographicService) {

    this.showReadingTime = SiriusConfig.isReadingTimeDisplayed;
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

  private async openInfographicDialog() {
    const dialog = this.dialogService.open({
      viewModel: InfographicDialog,
      overlayDismiss: true,
      lock: true,
    });

    await dialog;

    this.applicationState.isMenuOpen = false;

    this.trackingService.event('openInfographDialog');

    const dialogResult = await dialog.whenClosed();

    if (dialogResult.wasCancelled) {
      this.trackingService.event('closeInfographDialog');
      return;
    }

    this.trackingService.event('openInfograph');

    // TODO: Show infographic
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
