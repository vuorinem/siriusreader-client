import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { LibraryService } from './library-service';
import { ITitleDetails } from './i-title-details';
import { ITitle } from './i-title';

type TabName =
  'description'
  | 'reviews'
  | 'firstPage';

@autoinject
export class TitleDialog implements DialogComponentActivate<ITitle> {

  private title?: ITitleDetails;
  private selectedTabName: TabName = 'description';

  constructor(
    private dialogController: DialogController,
    private libraryService: LibraryService) {
  }

  public async activate(title: ITitle) {
    this.title = await this.libraryService.getTitle(title.bookId);
  }

  private selectTab(tabName: TabName) {
    // TODO: Track

    this.selectedTabName = tabName;
  }

}
