import { TrackingService } from 'tracking/tracking-service';
import { ConfirmSelectionDialog } from './confirm-selection-dialog';
import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate, DialogService } from 'aurelia-dialog';
import { LibraryService } from './library-service';
import { ITitleDetails } from './i-title-details';
import { ITitle } from './i-title';
import { TitleDialogSectionActions } from 'tracking/library-event-type';

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
    private libraryService: LibraryService,
    private trackingService: TrackingService) {
  }

  public async activate(title: ITitle) {
    this.title = await this.libraryService.getTitle(title.bookId);
  }

  private selectTab(tab: TabDetails) {
    if (tab.isSelected) {
      this.trackingService.libraryEvent(tab.name + 'Hide' as TitleDialogSectionActions);
      tab.isSelected = false;
    } else {
      this.tabs.forEach(t => {
        if (t.isSelected) {
          this.trackingService.libraryEvent(t.name + 'Hide' as TitleDialogSectionActions);
          t.isSelected = false;
        }
      });

      this.trackingService.libraryEvent(tab.name + 'Show' as TitleDialogSectionActions);
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

    this.trackingService.libraryEvent('clickSelectBook');

    const confirmed = async () => {
      this.trackingService.libraryEvent('confirmSelectBook');
      this.dialogController.ok();
    };

    const cancelled = async () => {
      this.trackingService.libraryEvent('cancelSelectBook');
    };

    await confirmDialog.whenClosed(confirmed, cancelled);
  }

}
