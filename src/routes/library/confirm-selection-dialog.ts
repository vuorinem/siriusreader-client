import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { ITitleDetails } from './i-title-details';

@autoinject
export class ConfirmSelectionDialog implements DialogComponentActivate<ITitleDetails> {

  private title?: ITitleDetails;

  constructor(private dialogController: DialogController) {
  }

  public async activate(title: ITitleDetails) {
    this.title = title;
  }
}
