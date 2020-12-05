import { Router } from 'aurelia-router';
import { UserService } from 'user/user-service';
import { autoinject, PLATFORM } from 'aurelia-framework';
import { RouterConfiguration } from 'aurelia-router';

@autoinject
export class Index {
  constructor(
    private router: Router,
    private userService: UserService) {
  }

  public activate() {
    if (!this.userService.isDeadlinePassed && !this.userService.user?.isBookFinished) {
      this.router.navigate('main');
    }
  }

  public configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: 'questionnaire21',
        route: 'questionnaire21',
        moduleId: PLATFORM.moduleName("./questionnaire21"),
      },
      {
        name: 'questionnaire22',
        route: 'questionnaire22',
        moduleId: PLATFORM.moduleName("./questionnaire22"),
      },
      {
        name: 'questionnaire3',
        route: 'questionnaire3',
        moduleId: PLATFORM.moduleName("./questionnaire3"),
      },
      {
        name: 'debrief',
        route: 'debrief',
        moduleId: PLATFORM.moduleName("./debrief"),
      },
    ]);
  }
}
