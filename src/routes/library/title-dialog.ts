import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { LibraryService } from './library-service';
import { ITitleDetails } from './i-title-details';

@autoinject
export class TitleDialog implements DialogComponentActivate<number> {

  private title?: ITitleDetails;

  constructor(
    private dialogController: DialogController,
    private libraryService: LibraryService) {
  }

  public async activate(bookId: number) {
    this.title = await this.libraryService.getTitle(bookId);
  }

}
