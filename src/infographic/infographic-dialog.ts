import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';

@autoinject
export class InfographicDialog {

  constructor(private dialogController: DialogController) {
  }

}
