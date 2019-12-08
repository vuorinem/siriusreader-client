import { Router } from 'aurelia-router';
import { UserService } from './../user/user-service';
import { autoinject } from 'aurelia-framework';

@autoinject
export class Main {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  public async activate() {
    if (!this.userService.user.isInformationSheetConfirmed) {
      this.router.navigate("/introduction/information");
    } else if (!this.userService.user.isConsentConfirmed) {
      this.router.navigate("/introduction/consent");
    } else if (!this.userService.isReadingSpeedTested) {
      this.router.navigate("/introduction/reading-speed");
    } else if (!this.userService.user.isBookSelected){
      this.router.navigate("/books");
    } else if (this.userService.isDeadlinePassed) {
      this.router.navigate("/finish");
    }

    // TODO: Questionnaire redirects
  }
}
