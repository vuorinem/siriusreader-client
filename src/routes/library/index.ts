import { ConfiguresRouter, RouterConfiguration, Router } from 'aurelia-router';
import { autoinject, PLATFORM } from 'aurelia-framework';

@autoinject
export class Index implements ConfiguresRouter {
  private router?: Router;

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
}
