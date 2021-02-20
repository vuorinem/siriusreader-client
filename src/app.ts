import { EventType } from './tracking/event-type';
import { TrackingService } from './tracking/tracking-service';
import { ApplicationState } from './state/application-state';
import { UserService } from './user/user-service';
import { PLATFORM } from 'aurelia-pal';
import { WindowTrackingService } from './tracking/window-tracking-service';
import { autoinject, ComponentAttached, ComponentDetached, computedFrom } from 'aurelia-framework';
import { AuthService } from './auth/auth-service';
import { ConfiguresRouter, RouterConfiguration, Router, PipelineStep, Redirect } from "aurelia-router";
import { LibraryEventType } from './tracking/library-event-type';

@autoinject
export class App implements ConfiguresRouter, ComponentAttached, ComponentDetached {
  private router?: Router;

  @computedFrom('router.currentInstruction')
  private get isPublicRoute(): boolean {
    if (!this.router) {
      return false;
    }

    if (!this.router.currentInstruction) {
      return false;
    }

    return this.router.currentInstruction.config.settings?.public;
  }

  constructor(
    private applicationState: ApplicationState,
    private authService: AuthService,
    private userService: UserService,
    private trackingService: TrackingService,
    private windowTrackingService: WindowTrackingService) {
  }

  public attached(): void {
    this.windowTrackingService.attach();
  }

  public detached(): void {
    this.windowTrackingService.detach();
  }

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.title = "Sirius Reader";
    config.options.pushState = true;
    config.options.root = '/';

    config.addAuthorizeStep(this.getAuthorizeStep());
    config.addPreActivateStep(this.getCloseMenuStep());
    config.addPreActivateStep(this.getTrackEventStep('pageNavigation'));

    config.map([
      {
        title: "Home",
        name: "home",
        route: "home",
        moduleId: PLATFORM.moduleName("./routes/public/home"),
        nav: true,
        settings: {
          public: true,
        },
      },
      {
        title: "Information",
        name: "information",
        route: "information",
        moduleId: PLATFORM.moduleName("./routes/public/information"),
        nav: true,
        settings: {
          public: true,
        },
      },
      {
        title: "FAQ",
        name: "faq",
        route: "faq",
        moduleId: PLATFORM.moduleName("./routes/public/faq"),
        nav: true,
        settings: {
          public: true,
        },
      },
      {
        title: "Contact",
        name: "contact",
        route: "contact",
        moduleId: PLATFORM.moduleName("./routes/public/home"),
        nav: true,
        settings: {
          public: true,
        },
      },
      {
        title: "Take Part",
        name: "register",
        route: "register",
        moduleId: PLATFORM.moduleName("./routes/public/register"),
        nav: true,
        settings: {
          public: true,
        },
      },
      {
        title: "Forgot Password",
        name: "forgot-password",
        route: "forgot-password",
        moduleId: PLATFORM.moduleName("./routes/public/forgot-password"),
        settings: {
          public: true,
        },
      },
      {
        title: "Login",
        name: "login",
        route: "login",
        moduleId: PLATFORM.moduleName("./routes/public/login"),
        settings: {
          public: true,
        },
      },
      {
        name: "unsubscribe",
        route: "unsubscribe/*id",
        moduleId: PLATFORM.moduleName("./routes/unsubscribe"),
        settings: {
          public: true,
        },
      },
      {
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
        name: "library",
        route: "library",
        moduleId: PLATFORM.moduleName("./routes/library/index"),
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
        name: "confirm-finish",
        route: "confirm-finish",
        moduleId: PLATFORM.moduleName("./routes/confirm-finish"),
        settings: {
          auth: true,
        },
      },
      {
        name: "finish",
        route: "finish",
        moduleId: PLATFORM.moduleName("./routes/finish/index"),
        settings: {
          auth: true,
        },
      },
      {
        name: "not-found",
        route: "not-found",
        moduleId: PLATFORM.moduleName("./routes/not-found"),
        settings: {
          auth: true,
        },
      },
    ]);

    config.mapUnknownRoutes(PLATFORM.moduleName("./routes/not-found"));
  }

  private getAuthorizeStep(): PipelineStep {
    const authService = this.authService;
    const userService = this.userService;

    return {
      run: async (instruction, next) => {
        const requiresAuth = instruction.getAllInstructions()
          .some(i => i.config.settings && i.config.settings.auth);

        if (requiresAuth) {
          if (!authService.isAuthenticated) {
            return next.cancel(new Redirect("login"));
          }

          if (!userService.user) {
            await userService.load();
          }

          if (!userService.user) {
            await this.trackingService.stop();

            authService.logout();

            return next.cancel(new Redirect("login"));
          }
        }

        return next();
      }
    }
  }

  private getCloseMenuStep(): PipelineStep {
    const applicationState = this.applicationState;

    return {
      run: async (instruction, next) => {
        applicationState.isMenuOpen = false;
        applicationState.isReading = false;

        return next();
      }
    }
  }

  private getTrackEventStep(eventType: EventType & LibraryEventType): PipelineStep {
    const trackingService = this.trackingService;

    return {
      run: async (instruction, next) => {
        trackingService.event(eventType);
        trackingService.libraryEvent(eventType);

        return next();
      }
    }
  }
}
