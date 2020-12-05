import { Router } from 'aurelia-router';
import { HttpClient } from 'aurelia-fetch-client';
import { UserService } from './../../user/user-service';
import { autoinject, computedFrom } from 'aurelia-framework';

@autoinject
export class Information {

  private isConfirmed: boolean = false;

  @computedFrom('isConfirmed', 'http.isRequesting')
  private get canContinue(): boolean {
    return this.isConfirmed &&
      !this.http.isRequesting;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService) {
  }

  public activate() {
    if (!this.userService.user || this.userService.user.isInformationSheetConfirmed) {
      this.router.navigateToRoute("main");
    }
  }

  private async confirm() {
    if (!this.isConfirmed) {
      return;
    }

    await this.userService.sendConfirmInformationSheet();

    this.router.navigateToRoute("consent");
  }

}
