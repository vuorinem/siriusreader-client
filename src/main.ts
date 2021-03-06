import { SiriusConfig } from './config/sirius-config';
import { Aurelia } from 'aurelia-framework'
import { PLATFORM } from 'aurelia-pal';
import 'utility/custom-event-polyfill';

import 'styles/app.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { DialogConfiguration } from 'aurelia-dialog';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin(PLATFORM.moduleName("aurelia-animator-css"))
    .plugin(PLATFORM.moduleName('aurelia-dialog'), (config: DialogConfiguration) => {
      config.useDefaults();
      config.settings.keyboard = true;
      config.settings.overlayDismiss = true;
    });

  aurelia.use.developmentLogging(SiriusConfig.debug ? 'debug' : 'warn');

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
