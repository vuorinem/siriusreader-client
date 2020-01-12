import { BookInformationDialog } from './../book/book-information-dialog';
import { DialogService } from 'aurelia-dialog';
import { BookService } from './../book/book-service';
import { Router } from 'aurelia-router';
import { UserService } from './../user/user-service';
import { autoinject } from 'aurelia-framework';

@autoinject
export class Main {
  private canRead: boolean = false;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private userService: UserService,
    private bookService: BookService) {
  }

  public async activate() {
    if (!this.userService.user.isInformationSheetConfirmed) {
      this.router.navigate("/introduction/information");
    } else if (!this.userService.user.isConsentConfirmed) {
      this.router.navigate("/introduction/consent");
    } else if (!this.userService.isReadingSpeedTested) {
      this.router.navigate("/introduction/reading-speed");
    } else if (!this.userService.user.isBookSelected) {
      this.router.navigate("/introduction/books");
    } else if (this.userService.isDeadlinePassed) {
      this.router.navigate("/finish");
    } else {
      await this.bookService.loadSelectedBook();

      if (!this.userService.user.isBookOpened) {
        await this.dialogService.open({
          viewModel: BookInformationDialog,
          model: this.bookService.book,
          overlayDismiss: true,
          lock: true,
        }).whenClosed();

        await this.userService.sendConfirmBookOpened();
      }

      this.canRead = true;
    }

    // TODO: Questionnaire redirects
  }
}
