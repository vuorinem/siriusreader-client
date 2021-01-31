import { ApplicationState } from './../../state/application-state';
import { ConfiguresRouter, RouterConfiguration, Router, RoutableComponentActivate, IObservable, NavigationInstruction, RouteConfig } from 'aurelia-router';
import { autoinject, PLATFORM } from 'aurelia-framework';

@autoinject
export class Index implements ConfiguresRouter, RoutableComponentActivate {
  private router?: Router;

  constructor(private applicationState: ApplicationState) { }

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.map([
      {
        title: "Library",
        name: "list",
        route: "",
        moduleId: PLATFORM.moduleName("./list"),
      },
    ]);
  }

  public activate() {
    this.applicationState.isLibrary = true;
  }
}
