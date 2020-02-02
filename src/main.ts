import { Aurelia } from 'aurelia-framework'
import * as environment from '../config/environment.json';
import { PLATFORM } from 'aurelia-pal';
import 'utility/custom-event-polyfill';

import 'styles/app.scss';
import { DialogConfiguration } from 'aurelia-dialog';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin(PLATFORM.moduleName("aurelia-animator-css"))
    .plugin(PLATFORM.moduleName('aurelia-dialog'), (config: DialogConfiguration) => {
      config.useDefaults();
      config.settings.keyboard = true;
      config.settings.overlayDismiss = true;
    })
    .globalResources([
      PLATFORM.moduleName('utility/disable-on-request-custom-attribute'),
    ]);

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
