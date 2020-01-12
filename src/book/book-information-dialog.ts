import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { IBookDetails } from './i-book-details';

@autoinject
export class BookInformationDialog implements DialogComponentActivate<IBookDetails> {

  private book?: IBookDetails;

  constructor(private dialogController: DialogController) {
  }

  public activate(model?: IBookDetails) {
    this.book = model;
  }

}
