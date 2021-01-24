import { autoinject, useView, PLATFORM } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { LibraryService } from './library-service';
import { ITitleDetails } from './i-title-details';
import { ITitle } from './i-title';

type TabName =
  'synopsis'
  | 'reviews'
  | 'details'
  | 'firstPage';

@autoinject
export class TitleDialog implements DialogComponentActivate<ITitle> {

  private title?: ITitleDetails;
  private selectedTabName?: TabName;

  constructor(
    private dialogController: DialogController,
    private libraryService: LibraryService) {
  }

  public async activate(title: ITitle) {
    this.title = await this.libraryService.getTitle(title.bookId);
  }

  private selectTab(tabName: TabName) {
    // TODO: Track

    if (this.selectedTabName === tabName) {
      this.selectedTabName = undefined;
    } else {
      this.selectedTabName = tabName;
    }
  }

}
