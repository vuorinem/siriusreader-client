import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { UserService } from 'user/user-service';

@autoinject
export class Questionnaire11 {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  public activate() {
    if (this.userService.isQuestionnaireAnswered('questionnaire11')) {
      this.router.navigateToRoute("main");
    }
  }

  private done() {
    this.router.navigateToRoute("main");
  }
}
