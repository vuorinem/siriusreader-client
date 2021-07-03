import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { UserService } from "user/user-service";

@autoinject
export class Infographic {

  constructor(
    private router: Router,
    private userService: UserService) {
  }

  public activate() {
    if (!this.userService.user?.isInfographicReady) {
      this.router.navigateToRoute("main");
    }
  }

}
