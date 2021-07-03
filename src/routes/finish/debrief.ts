import { HttpClient } from "aurelia-fetch-client";
import { autoinject, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { UserService } from "user/user-service";

@autoinject
export class Debrief {

  @computedFrom('http.isRequesting')
  private get canContinue(): boolean {
    return !this.http.isRequesting;
  }

  @computedFrom('userService.user.isInfographicReady')
  private get isInfographicAvailable(): boolean {
    return this.userService.user?.isInfographicReady ?? false;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService) {
  }

  private async confirm() {
    if (!this.canContinue) {
      return;
    }

    if (!this.userService.user?.isDebriefConfirmed) {
      await this.userService.sendConfirmDebrief();
    }

    this.router.navigate("infographic");
  }

}
