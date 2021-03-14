import { autoinject, PLATFORM } from 'aurelia-framework';
import { RouterConfiguration } from 'aurelia-router';

@autoinject
export class Index {
  public configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: 'information',
        route: 'information',
        moduleId: PLATFORM.moduleName("./information"),
      },
      {
        name: 'consent',
        route: 'consent',
        moduleId: PLATFORM.moduleName("./consent"),
      },
      {
        name: 'reading-speed',
        route: 'reading-speed',
        moduleId: PLATFORM.moduleName("./reading-speed"),
      },
      {
        name: 'questionnaire11',
        route: 'questionnaire11',
        moduleId: PLATFORM.moduleName("./questionnaire11"),
      },
      {
        name: 'questionnaire12',
        route: 'questionnaire12',
        moduleId: PLATFORM.moduleName("./questionnaire12"),
      },
      {
        name: 'questionnaire-art',
        route: 'questionnaire-art',
        moduleId: PLATFORM.moduleName("./questionnaire-art"),
      },
    ]);
  }
}
