import { ApplicationState } from './../../state/application-state';
import { TrackingService } from './../../tracking/tracking-service';
import { UserService } from './../../user/user-service';
import { TitleDialog } from './title-dialog';
import { DialogService } from 'aurelia-dialog';
import { TimeoutService } from './../../utility/timeout-service';
import { RoutableComponentActivate, Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { LibraryService } from './library-service';
import { ITitle } from './i-title';

const MinTitleWidth = 200;
const MaxVisibleTitles = 3;

@autoinject
export class List implements RoutableComponentActivate {
  private shelvedTitles: ITitle[] = [];
  private visibleTitles: ITitle[] = [];

  private libraryWindowElement?: HTMLDivElement;
  private libraryContentElement?: HTMLDivElement;
  private direction?: 'next' | 'previous' = 'next';

  private onWindowResize: () => void = () => this.handleWindowResize();

  public constructor(
    private router: Router,
    private dialogService: DialogService,
    private userService: UserService,
    private applicationState: ApplicationState,
    private timeoutService: TimeoutService,
    private libraryService: LibraryService,
    private trackingService: TrackingService) {
  }

  public async activate() {
    this.shelvedTitles = await this.libraryService.getTitles();

    this.refreshList();
  }

  public attached() {
    this.trackingService.libraryEvent('openLibrary');

    window.addEventListener('resize', this.onWindowResize, false);

    this.refreshList();
  }

  public detached() {
    this.trackingService.libraryEvent('closeLibrary');

    this.applicationState.libraryVisibleBooks = [];
    this.applicationState.libraryVisibleSections = [];

    window.removeEventListener('resize', this.onWindowResize);
  }

  private next() {
    this.finishTransitions();

    this.trackingService.libraryEvent('clickNext');

    this.direction = 'next';
    this.shelvedTitles.push(...this.visibleTitles.splice(0, 1));
    this.visibleTitles.push(...this.shelvedTitles.splice(0, 1));

    this.updateApplicationState();
  }

  private previous() {
    this.finishTransitions();

    this.trackingService.libraryEvent('clickPrevious');

    this.direction = 'previous';
    this.shelvedTitles.unshift(...this.visibleTitles.splice(-1, 1));
    this.visibleTitles.unshift(...this.shelvedTitles.splice(-1, 1));

    this.updateApplicationState();
  }

  private async openTitle(title: ITitle) {
    const dialog = this.dialogService.open({
      viewModel: TitleDialog,
      model: title,
      overlayDismiss: false,
      lock: true,
      rejectOnCancel: true,
      centerHorizontalOnly: true,
    });

    await dialog;

    const selectTitle = async () => {
      this.updateApplicationState();
      this.trackingService.libraryEvent('closeDialog');

      await this.userService.sendBookSelection(title.bookId);
      this.router.navigateToRoute('main');
    };

    const closeTitle = async () => {
      this.updateApplicationState();
      this.trackingService.libraryEvent('closeDialog');
    };

    await dialog.whenClosed(selectTitle, closeTitle);
  }

  private handleWindowResize() {
    this.timeoutService.debounce('resize', 500, async () => {
      this.trackingService.libraryEvent('resize');
      this.refreshList();
    });
  }

  private finishTransitions() {
    if (this.libraryContentElement) {
      this.libraryContentElement.querySelectorAll('.library-item').forEach(item => {
        if ('getAnimations' in item) {
          item.getAnimations().forEach(animation => animation.finish());
        }
      });
    }
  }

  private itemTransitionEnd() {
    this.direction = undefined;
  }

  private refreshList() {
    const numberOfVisibleTitles = this.getNumberOfVisibleTitles();
    const numberOfTitlesToShow = numberOfVisibleTitles - this.visibleTitles.length;

    if (this.libraryContentElement) {
      this.libraryContentElement.style.gridTemplateColumns = '1fr '.repeat(numberOfVisibleTitles);
    }

    if (numberOfTitlesToShow > 0) {
      this.visibleTitles.push(...this.shelvedTitles.splice(0, numberOfTitlesToShow));
    } else if (numberOfTitlesToShow < 0) {
      this.shelvedTitles.unshift(...this.visibleTitles.splice(numberOfTitlesToShow));
    }

    this.updateApplicationState();
  }

  private getNumberOfVisibleTitles(): number {
    if (!this.libraryWindowElement) {
      return MaxVisibleTitles;
    }

    const rect = this.libraryWindowElement.getBoundingClientRect();
    const numberOfVisibleTitless = Math.floor(rect.width / MinTitleWidth);

    return Math.min(numberOfVisibleTitless, MaxVisibleTitles);
  }

  private updateApplicationState() {
    this.applicationState.libraryVisibleBooks = this.visibleTitles.map(t => t.bookId);
    this.applicationState.libraryVisibleSections = [];
  }
}
