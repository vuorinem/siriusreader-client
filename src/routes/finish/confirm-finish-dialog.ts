import { autoinject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@autoinject
export class ConfirmFinishDialog {
  
  constructor(private dialogController: DialogController) {
  }
  
}
