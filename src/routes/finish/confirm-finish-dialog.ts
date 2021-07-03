import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';

@autoinject
export class ConfirmFinishDialog implements DialogComponentActivate<boolean | undefined> {
  
  private isInfographicReady = false;

  constructor(private dialogController: DialogController) {
  }

  activate(isInfographicReady?: boolean) {
    this.isInfographicReady = isInfographicReady ?? false;
  }
  
}
