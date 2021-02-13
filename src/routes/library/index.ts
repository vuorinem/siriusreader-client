import { ApplicationState } from './../../state/application-state';
import { ConfiguresRouter, RouterConfiguration, Router, RoutableComponentActivate } from 'aurelia-router';
import { autoinject, PLATFORM } from 'aurelia-framework';

@autoinject
export class Index implements ConfiguresRouter, RoutableComponentActivate {

  constructor(private applicationState: ApplicationState) { }

  public configureRouter(config: RouterConfiguration, router: Router) {

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
