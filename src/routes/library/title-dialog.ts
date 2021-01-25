import { ConfirmSelectionDialog } from './confirm-selection-dialog';
import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate, DialogService } from 'aurelia-dialog';
import { LibraryService } from './library-service';
import { ITitleDetails } from './i-title-details';
import { ITitle } from './i-title';

type TabDetails = {
  name: keyof (ITitleDetails),
  title: string,
  isSelected: boolean,
};

@autoinject
export class TitleDialog implements DialogComponentActivate<ITitle> {

  private title?: ITitleDetails;

  private tabs: TabDetails[] = [
    {
      name: 'synopsis',
      title: 'Synopsis',
      isSelected: false,
    },
    {
      name: 'reviews',
      title: 'Reviews',
      isSelected: false,
    },
    {
      name: 'details',
      title: 'Details',
      isSelected: false,
    },
    {
      name: 'firstPage',
      title: 'First page',
      isSelected: false,
    },
  ]

  constructor(
    private dialogController: DialogController,
    private dialogService: DialogService,
    private libraryService: LibraryService) {
  }

  public async activate(title: ITitle) {
    this.title = await this.libraryService.getTitle(title.bookId);
  }

  private selectTab(tab: TabDetails) {
    if (tab.isSelected) {
      tab.isSelected = false;
    } else {
      this.tabs.forEach(t => t.isSelected = false);
      tab.isSelected = true;
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
