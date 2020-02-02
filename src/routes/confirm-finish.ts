import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { UserService } from 'user/user-service';

@autoinject
export class ConfirmFinish {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  public activate() {
    if (this.userService.user.isBookFinished) {
      this.router.navigateToRoute("main");
    }
  }

  private async confirm() {
    await this.userService.sendConfirmBookFinished();
    
    this.router.navigateToRoute("main");
  }
}
