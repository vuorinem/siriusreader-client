import { UserService } from 'user/user-service';
import { autoinject, computedFrom } from 'aurelia-framework';

@autoinject
export class Debrief {

  @computedFrom('userService.user')
  private get isIntrinsic(): boolean {
    if (!this.userService.user) {
      return false;
    }

    return this.userService.user.isIntrinsicCondition;
  }

  constructor(private userService: UserService) {
  }

}
