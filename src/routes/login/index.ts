import { AuthService } from './../../auth/auth-service';
import { ConfiguresRouter, RoutableComponentActivate, RouterConfiguration, Router } from 'aurelia-router';
import { autoinject, PLATFORM } from 'aurelia-framework';

@autoinject
export class Index implements RoutableComponentActivate, ConfiguresRouter {
  private router: Router;

  constructor(private authService: AuthService) {
  }

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.map([
      {
        nav: true,
        title: "Existing User",
        name: "login",
        route: "",
        moduleId: PLATFORM.moduleName("./login"),
      },
      {
        nav: true,
        title: "New User / Reset Password",
        name: "register",
        route: "register",
        moduleId: PLATFORM.moduleName("./register"),
      },
    ]);
  }

  public activate() {
    if (this.authService.isAuthenticated) {
      this.router.navigateToRoute("main");
    }
  }
}
