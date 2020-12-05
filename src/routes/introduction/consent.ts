import { HttpClient } from 'aurelia-fetch-client';
import { UserService } from './../../user/user-service';
import { autoinject, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@autoinject
export class Consent {

  private consentsConfirmed: string[] = [];

  @computedFrom('consentsConfirmed.length', 'http.isRequesting')
  private get canContinue(): boolean {
    return this.consentsConfirmed.length === 8 &&
      !this.http.isRequesting;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService) {
  }

  public activate() {
    if (!this.userService.user || this.userService.user.isConsentConfirmed) {
      this.router.navigateToRoute("main");
    }
  }

  private async confirm() {
    if (!this.canContinue) {
      return;
    }

    await this.userService.sendConfirmConsent();

    this.router.navigate("reading-speed");
  }

}
