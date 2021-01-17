import { TimeoutService } from './../../utility/timeout-service';
import { RoutableComponentActivate } from 'aurelia-router';
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

  private onWindowResize: () => void = () => this.handleWindowResize();

  public constructor(
    private timeoutService: TimeoutService,
    private libraryService: LibraryService,) {
  }

  public async activate() {
    this.shelvedTitles = await this.libraryService.getTitles();

    this.refreshList();
  }

  public attached() {
    window.addEventListener('resize', this.onWindowResize, false);
    this.refreshList();
  }

  public detached() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  private next() {
    this.shelvedTitles.push(...this.visibleTitles.splice(0, 1));
    this.visibleTitles.push(...this.shelvedTitles.splice(0, 1));
  }

  private previous() {
    this.shelvedTitles.unshift(...this.visibleTitles.splice(-1, 1));
    this.visibleTitles.unshift(...this.shelvedTitles.splice(-1, 1));
  }

  private handleWindowResize() {
    this.timeoutService.debounce('resize', 500, async () => {
      this.refreshList();
    });
  }

  private refreshList() {
    const numberOfVisibleTitles = this.getNumberOfVisibleTitles();
    const numberOfTitlesToShow = numberOfVisibleTitles - this.visibleTitles.length;

    if (numberOfTitlesToShow > 0) {
      this.visibleTitles.push(...this.shelvedTitles.splice(0, numberOfTitlesToShow));
    } else if (numberOfTitlesToShow < 0) {
      this.shelvedTitles.unshift(...this.visibleTitles.splice(numberOfTitlesToShow));
    }
  }

  private getNumberOfVisibleTitles(): number {
    if (!this.libraryWindowElement) {
      return MaxVisibleTitles;
    }

    const rect = this.libraryWindowElement.getBoundingClientRect();
    const numberOfVisibleTitless = Math.floor(rect.width / MinTitleWidth);

    return Math.min(numberOfVisibleTitless, MaxVisibleTitles);
  }
}
