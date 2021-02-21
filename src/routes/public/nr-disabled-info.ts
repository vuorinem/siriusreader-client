
import { bindable } from 'aurelia-framework';
import { SiriusConfig } from './../../config/sirius-config';

export class NrDisabledInfo {
  @bindable private isDisabled = SiriusConfig.isRegistrationDisabled;
}
