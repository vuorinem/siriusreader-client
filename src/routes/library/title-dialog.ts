import { ConfirmSelectionDialog } from './confirm-selection-dialog';
import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate, DialogService } from 'aurelia-dialog';
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
    private dialogService: DialogService,
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

  private async selectBook() {
    const confirmDialog = this.dialogService.open({
      viewModel: ConfirmSelectionDialog,
      model: this.title,
      overlayDismiss: false,
      lock: true,
      rejectOnCancel: true
    });

    await confirmDialog;

    // TODO: Track dialog open

    const confirmed = async () => {
      // TODO: Track dialog close
      this.dialogController.ok();
    };

    const cancelled = async () => {
      // TODO: Track dialog close
    };

    await confirmDialog.whenClosed(confirmed, cancelled);
  }

}
