import { autoinject, PLATFORM } from 'aurelia-framework';
import { RouterConfiguration } from 'aurelia-router';

@autoinject
export class Introduction {
  public configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: 'confirm',
        route: 'confirm',
        moduleId: PLATFORM.moduleName("./confirm"),
      },
      // TODO: Add final questionnaire
      {
        name: 'debrief',
        route: 'debrief',
        moduleId: PLATFORM.moduleName("./debrief"),
      },
    ]);
  }
}
