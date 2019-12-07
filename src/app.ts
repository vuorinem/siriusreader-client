import { UserService } from './user/user-service';
import { PLATFORM } from 'aurelia-pal';
import { WindowTrackingService } from './tracking/window-tracking-service';
import { autoinject } from 'aurelia-framework';
import { AuthService } from './auth/auth-service';
import { ConfiguresRouter, RouterConfiguration, Router, PipelineStep, Redirect } from "aurelia-router";

@autoinject
export class App implements ConfiguresRouter {
  private isMenuOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private windowTrackingService: WindowTrackingService) {
  }

  public configureRouter(config: RouterConfiguration, router: Router) {
    config.title = "Sirius Reader";
    config.options.pushState = true;
    config.options.root = '/';
    config.addAuthorizeStep(this.getAuthorizeStep());

    config.map([
      {
        name: "login",
        route: "login",
        moduleId: PLATFORM.moduleName("./routes/login/index"),
      }, {
        name: "logout",
        route: "logout",
        moduleId: PLATFORM.moduleName("./routes/logout"),
        settings: {
          auth: true,
        },
      },
      {
        name: "introduction",
        route: "introduction",
        moduleId: PLATFORM.moduleName("./routes/introduction/index"),
        settings: {
          auth: true,
        },
      },
      {
        name: "questionnaire",
        route: "questionnaire",
        moduleId: PLATFORM.moduleName("./routes/questionnaire"),
        settings: {
          auth: true,
        },
      },
      {
        name: "main",
        route: "",
        moduleId: PLATFORM.moduleName("./routes/main"),
        settings: {
          auth: true,
        },
      },
      {
        name: "finish",
        route: "finish",
        moduleId: PLATFORM.moduleName("./routes/finish"),
        settings: {
          auth: true,
        },
      }
    ]);
  }

  public getAuthorizeStep(): PipelineStep {
    const authService = this.authService;
    const userService = this.userService;

    return {
      run: async (instruction, next) => {
        const requiresAuth = instruction.getAllInstructions().some(i => i.config.settings.auth);

        if (requiresAuth) {
          if (!authService.isAuthenticated) {
            return next.cancel(new Redirect("login"));
          }

          if (!userService.user) {
            await userService.load();
          }
        }

        return next();
      }
    }
  }
}
