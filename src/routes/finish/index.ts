import { autoinject, PLATFORM } from 'aurelia-framework';
import { RouterConfiguration } from 'aurelia-router';

@autoinject
export class Index {
  public configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: 'confirm',
        route: 'confirm',
        moduleId: PLATFORM.moduleName("./confirm"),
      },
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
