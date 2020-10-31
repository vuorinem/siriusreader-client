import { UserService } from 'user/user-service';
import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './../state/application-state';
import { HighlightedText } from '../reading/highlighted-text';
import { Highlighter } from './../reading/highlighter';
import { TimeoutService } from '../utility/timeout-service';
import { DomUtility } from './../reading/dom-utility';
import { TrackingService } from './../tracking/tracking-service';
import { ReadingState } from './../reading/reading-state';
import { bookConfig } from './book-config';
import { SectionModel } from './section-model';
import { BindingEngine, Disposable, computedFrom } from 'aurelia-binding';
import { autoinject, ComponentAttached, ComponentDetached, TaskQueue } from 'aurelia-framework';
import { BookService } from './book-service';
import { IBookDetails } from '../book/i-book-details';
import { ReadingService } from '../reading/reading-service';
import { BookInformationDialog } from './book-information-dialog';
import * as environment from '../../config/environment.json';

type BrowseStyle = 'turn' | 'jump';

const SwipeThreshold = 20;
const HorizontalScrollThreshold = 20;
const HighlightMenuWidth = 310;
const HighlightMenuHeight = 80;
const LongTouchThreshold = 1000;
const InactiveTimeoutInMinutes = 5;

@autoinject
export class NrBook implements ComponentAttached, ComponentDetached {
  private book?: IBookDetails;
  private sections: SectionModel[] = [];

  private isHighlightMenuOpen: boolean = false;
  private selectedHighlight: HighlightedText | null = null;
  private highlightMenuX: number = 0;
  private highlightMenuY: number = 0;

  private bookContentElement?: HTMLDivElement;
  private bookSectionsElement?: HTMLDivElement;
  private currentViewOffset: number = 0;
  private isTransitioning: boolean = false;
  private totalCharacters: number = 0;
  private viewWidth: number = 0;

  private observers: Disposable[] = [];

  private onKeyDown: (e: KeyboardEvent) => void = e => this.handleKeyDown(e);
  private onWheel: (e: WheelEvent) => void = e => this.handleWheel(e);
  private onWindowResize: () => void = () => this.handleWindowResize();

  private canTriggerPageTurn: boolean = false;
  private browseStyle: BrowseStyle = 'turn';
  private isInitialized: boolean = false;

  private touchStartX: number | null = null;
  private touchEndX: number | null = null;
  private touchStartY: number | null = null;
  private touchStartTime: Date | null = null;

  @computedFrom("applicationState.isMenuOpen", 'isInitialized', 'applicationState.isFocused',
    'applicationState.isActive', 'dialogService.hasOpenDialog')
  private get isContentHidden(): boolean {
    return this.dialogService.hasOpenDialog ||
      this.applicationState.isMenuOpen ||
      !this.applicationState.isActive ||
      !this.applicationState.isFocused ||
      !this.isInitialized;
  }

  @computedFrom('readingState.startLocation', 'totalCharacters')
  private get progressPercentage(): number {
    if (!this.totalCharacters) {
      return 0;
    }

    if (this.readingState.startLocation + this.readingState.characterCount >= this.totalCharacters) {
      // When showing the last page, show 100% instead of the percentage for the start of the page
      return 100;
    }

    return this.readingState.startLocation * 100 / this.totalCharacters;
  }

  @computedFrom('bookConfig.columnGap')
  private get columnGap(): number {
    return bookConfig.columnGap;
  }

  @computedFrom('columnCount')
  private get columnWidth(): string {
    if (this.columnCount === 1) {
      return '100vw';
    } else {
      return 'auto';
    }
  }

  @computedFrom('viewWidth', 'bookConfig.oneColumnThreshold')
  private get columnCount(): number {
    if (this.viewWidth < bookConfig.oneColumnThreshold) {
      return 1;
    } else {
      return 2;
    }
  }

  constructor(
    private bindingEngine: BindingEngine,
    private taskQueue: TaskQueue,
    private dialogService: DialogService,
    private applicationState: ApplicationState,
    private timeoutService: TimeoutService,
    private userService: UserService,
    private bookService: BookService,
    private readingState: ReadingState,
    private readingService: ReadingService,
    private trackingService: TrackingService,
    private highlighter: Highlighter,
    private domUtility: DomUtility) {
  }

  public async attached() {
    this.load();
  }

  public detached() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onWindowResize);

    this.clearInactiveTimeout();

    let observer: Disposable | undefined;
    while (observer = this.observers.pop()) {
      observer.dispose();
    }

    this.sections = [];
  }

  private async load(): Promise<void> {
    if (!this.userService.user.isBookOpened) {
      const dialog = this.dialogService.open({
        viewModel: BookInformationDialog,
        model: this.bookService.book,
        overlayDismiss: true,
        lock: true,
        rejectOnCancel: true,
      });

      await dialog;

      this.trackingService.event('bookDialogOpen');

      const dialogCloseCallback = async () => {
        await this.userService.sendConfirmBookOpened();

        this.trackingService.event('bookDialogClose');
      };

      dialog.whenClosed(dialogCloseCallback, dialogCloseCallback);
    }

    this.viewWidth = this.getViewWidthInPixels();

    this.book = this.bookService.book;

    this.highlighter.loadHighlights((event, highlight) => this.onHighlightClick(highlight));

    this.trackingService.event('openBook');

    let previousSection: SectionModel | undefined;

    this.totalCharacters = 0;

    for (const sectionData of this.book.sections) {
      const section = new SectionModel({
        url: sectionData.name,
        characters: sectionData.characters,
        previousSection: previousSection,
      });

      this.sections.push(section);

      previousSection = section;

      section.startLocation = this.totalCharacters;
      this.totalCharacters += section.characters;
      section.endLocation = this.totalCharacters;
    }

    await this.refreshSectionWidths();

    const startLocation = await this.readingService.getLocation();
    await this.jumpToLocation(startLocation);

    this.setInativeTimeout();

    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('wheel', this.onWheel, false);
    window.addEventListener('resize', this.onWindowResize, false);

    this.isInitialized = true;
  }

  private async jumpToLocation(location: number): Promise<void> {
    if (this.sections.length == 0) {
      return;
    }

    const section = this.sections.find(i => i.startLocation <= location && i.endLocation > location);

    if (!section) {
      const bookEndLocation = this.sections[this.sections.length - 1].endLocation;
      if (location >= bookEndLocation) {
        return this.jumpToLocation(bookEndLocation - 1);
      } else {
        throw Error("Invalid location");
      }
    }

    await section.load();

    await this.jumpToLocationInSection(section, location - section.startLocation);
  }

  private async jumpToLocationInSection(section: SectionModel, sectionLocation: number): Promise<void> {
    const offsetFromCurrentPage = this.domUtility.findOffsetForLocation(section.element, sectionLocation);
    const viewRect = this.bookContentElement.getBoundingClientRect();
    const offsetFromCurrentView = offsetFromCurrentPage - viewRect.left;
    const offsetFromStart = offsetFromCurrentView + this.currentViewOffset;

    await this.jumpToOffset(offsetFromStart);
  }

  private isLink(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }

    if (target instanceof HTMLAnchorElement) {
      return target.hasAttribute('href');
    }

    return this.isLink(target.parentElement);
  }

  private mouseDown(event: MouseEvent) {
    this.canTriggerPageTurn =
      event.button === 0 &&
      !this.isLink(event.target) &&
      this.isSelectionEmpty();

    this.setInativeTimeout();

    return true;
  }

  private mouseMove(event: MouseEvent) {
    if (!this.canTriggerPageTurn) {
      return true;
    }

    if (!this.isSelectionEmpty()) {
      this.canTriggerPageTurn = false;
    }

    return true;
  }

  private mouseLeave(event: MouseEvent) {
    this.canTriggerPageTurn = false;
  }

  private mouseUp(event: MouseEvent) {
    this.setInativeTimeout();

    if (this.handleHighlight(event.clientX, event.clientY)) {
      return;
    }

    if (!this.canTriggerPageTurn) {
      return true; // Revert to default action
    }

    this.canTriggerPageTurn = false;

    if (event.clientX > document.body.clientWidth / 2) {
      this.moveForward('click');
    } else {
      this.moveBack('click');
    }
  }

  private handleWheel(event: WheelEvent) {
    if (this.isContentHidden || this.isTransitioning) {
      return true;
    }

    this.setInativeTimeout();

    if (event.deltaY > 0) {
      this.moveForward('wheel');
    } else {
      this.moveBack('wheel');
    }
  }

  private touchStart(event: TouchEvent) {
    if (event.changedTouches.length !== 1) {
      return true;
    }

    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
    this.touchStartTime = new Date();

    return true;
  }

  private touchMove(event: TouchEvent) {
    this.setInativeTimeout();

    if (!this.touchStartX) {
      return true;
    }

    if (event.changedTouches.length !== 1 || !this.touchStartY) {
      this.endTouchHandling();
      return true;
    }

    const swipeX = event.changedTouches[0].clientX - this.touchStartX;
    const swipeY = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(swipeY) > Math.abs(swipeX) + HorizontalScrollThreshold) {
      this.endTouchHandling();

      if (swipeY > 0) {
        this.trackingService.event('swipeUp');
      } else {
        this.trackingService.event('swipeDown');
      }

      return true;
    }

    this.touchEndX = event.changedTouches[0].clientX;

    return true;
  }

  private touchEnd(event: TouchEvent) {
    this.setInativeTimeout();

    if (this.touchStartX === null) {
      return true;
    }

    if (this.handleLongTouch(event)) {
      this.endTouchHandling();
      return false;
    }

    if (event.changedTouches.length !== 1) {
      this.endTouchHandling();
      return true;
    }

    this.touchEndX = event.changedTouches[0].clientX;

    const swipeX = this.touchEndX - this.touchStartX;

    if (Math.abs(swipeX) > SwipeThreshold) {
      if (swipeX < 0) {
        this.moveForward('swipe');
      } else if (swipeX > 0) {
        this.moveBack('swipe');
      }
    } else if (this.handleHighlight(this.touchEndX, event.changedTouches[0].clientY)) {
      // The touch event was handled by highlighting
    } else if (this.isLink(event.target)) {
      return true;
    } else if (this.touchEndX > document.body.clientWidth / 2) {
      this.moveForward('touch');
    } else if (this.touchEndX < document.body.clientWidth / 2) {
      this.moveBack('touch');
    }

    this.endTouchHandling();

    return false;
  }

  private handleLongTouch(event: TouchEvent): boolean {
    if (!this.touchStartTime) {
      return false;
    }
    const touchDuration = new Date().valueOf() - this.touchStartTime.valueOf();

    if (touchDuration < LongTouchThreshold) {
      return false;
    }

    if (this.handleHighlight(event.changedTouches[0].clientX, event.changedTouches[0].clientY)) {
      return true;
    }

    return false
  }

  private touchCancel(event: TouchEvent) {
    this.endTouchHandling();
  }

  private endTouchHandling() {
    this.touchStartX = null;
    this.touchEndX = null;
    this.touchStartY = null;
  }

  private progressBarClick(event: MouseEvent) {
    this.setInativeTimeout();

    const progressBar = event.currentTarget as HTMLDivElement;
    const targetPercentage = event.offsetX / progressBar.clientWidth;
    const targetLocation = Math.round(this.totalCharacters * targetPercentage);

    this.trackingService.event('progressBarJump');

    this.taskQueue.queueTask(() => {
      this.jumpToLocation(targetLocation);
    });
  }

  private overlayClick() {
    this.setInativeTimeout();
    this.applicationState.isMenuOpen = false;
    this.trackingService.event('closeMenu');
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.isContentHidden || this.isTransitioning) {
      this.setInativeTimeout();

      return true;
    }

    this.setInativeTimeout();

    if (event.key == "ArrowRight" || event.key == "Right") {
      this.moveForward('keyboard');
    }

    if (event.key == "ArrowLeft" || event.key == "Left") {
      this.moveBack('keyboard');
    }

    this.handleDebugKey(event);
  }

  private moveForward(source: string) {
    this.move(this.viewWidth, source + 'Forward');
  }

  private moveBack(source: string) {
    this.move(-this.viewWidth, source + 'Backward');
  }

  private getViewWidthInPixels(): number {
    if (!this.bookContentElement) {
      throw new Error("Book is not yet initialized");
    }

    // Distance to the next view is book content width - paddings + one column gap
    const contentRect = this.bookSectionsElement.getBoundingClientRect();
    return contentRect.width - bookConfig.padding * 2 + this.columnGap;
  }

  private move(moveByPixels: number, source: string) {
    if (this.sections.some(section => section.isLoading)) {
      // Do not allow moving while loading
      return;
    }

    if (!this.readingState.section) {
      // Cannot turn page if we are not within a section
      return;
    }

    if (this.isTransitioning) {
      // Only allow one transition at the time
      return;
    }

    const newViewOffset = this.currentViewOffset + moveByPixels;

    if (!this.readingState.section.previousSection && this.readingState.section.left > newViewOffset) {
      // Trying to turn page before the start of the book
      return;
    }

    if (!this.readingState.section.nextSection && this.readingState.section.right - 1 < newViewOffset) {
      // Trying to turn page after the end of the book
      return;
    }

    this.trackingService.event(source);

    this.transitionTo(newViewOffset, 'turn');

    this.taskQueue.queueTask(() => {
      this.updateSectionVisibility();
    });
  }

  private async jumpToOffset(offset: number): Promise<void> {
    const jumpToPage = Math.floor(offset / this.viewWidth);
    const jumpToPixels = jumpToPage * this.viewWidth;

    await this.transitionTo(jumpToPixels, 'jump');

    this.updateSectionVisibility();
  }

  private async updateSectionVisibility(): Promise<void> {
    const sectionLoadPromises = this.sections.map(section => {
      if (section.right < this.currentViewOffset - this.viewWidth) {
        // Page is past the view
        section.unload();
        return Promise.resolve();
      }

      if (section.left > this.currentViewOffset + this.viewWidth) {
        // Page is not yet in the view
        section.unload();
        return Promise.resolve();
      }

      return section.load();
    });

    await Promise.all(sectionLoadPromises);
  }

  private async transitionTo(offset: number, browseStyle: BrowseStyle): Promise<void> {
    if (this.currentViewOffset === offset) {
      return;
    }

    this.closeHighlightMenu();
    this.isTransitioning = true;

    return new Promise(resolve => {
      const onTransitioned = () => {
        this.bookSectionsElement!.removeEventListener('transitionend', onTransitioned);
        this.isTransitioning = false;
        this.triggerOpenPage();

        resolve();
      }

      this.bookSectionsElement!.addEventListener('transitionend', onTransitioned, false);
      this.browseStyle = browseStyle;
      this.currentViewOffset = offset;
    });
  }

  private triggerOpenPage() {
    this.taskQueue.queueTask(() => {
      this.updateReadingStateAndProgress();

      this.trackingService.event('openPage');

      this.setInativeTimeout();
    });
  }

  private updateReadingStateAndProgress() {
    if (!this.book || !this.bookContentElement) {
      return;
    }

    this.readingState.setCurrentView(this.bookContentElement.getBoundingClientRect(), this.currentViewOffset, this.sections);

    if (!this.readingState.section) {
      return;
    }

    this.readingService.setLocation(this.readingState.startLocation);
  }

  private async refreshSectionWidths(): Promise<void> {
    const currentSectionLeft = this.readingState.section?.left;

    for (const section of this.sections) {
      section.pageWidth = this.viewWidth;
      section.columnCount = this.columnCount;
      section.refreshWidth();

      if (this.readingState.section === section) {
        const sectionMovedBy = section.left - currentSectionLeft;
        const newOffset = this.currentViewOffset + sectionMovedBy;
        await this.jumpToOffset(newOffset);
      }
    }
  }

  private isSelectionEmpty(): boolean {
    const selection = window.getSelection();

    return !(selection.toString().length > 0);
  }

  private setInativeTimeout() {
    this.applicationState.isActive = true;

    this.timeoutService.debounce('inactive', InactiveTimeoutInMinutes * 60 * 1000, async () => {
      if (this.isContentHidden) {
        return;
      }

      await this.trackingService.event('inactiveTimeout');

      this.applicationState.isActive = false;
    });
  }

  private clearInactiveTimeout() {
    this.timeoutService.cancel('inactive');
  }

  private handleWindowResize() {
    this.taskQueue.queueTask(() => {
      this.timeoutService.debounce('resize', 500, async () => {
        this.refreshIfWindowIsResized();
      });
    });
  }

  private async refreshIfWindowIsResized() {
    await this.trackingService.event('resize');

    this.setInativeTimeout();

    if (!this.readingState.view || !this.bookContentElement) {
      return;
    }

    const currentView = this.bookContentElement.getBoundingClientRect();

    if (this.readingState.view.width === currentView.width &&
      this.readingState.view.height === currentView.height) {
      return;
    }

    if (currentView.height < 400 && currentView.width < 400 || currentView.height < 150) {
      // Prevent resizing on mobile when keyboard shown
      return;
    }

    const locationBeforeResize = this.readingState.startLocation;

    this.viewWidth = this.getViewWidthInPixels();

    await this.refreshSectionWidths();

    await this.jumpToLocation(locationBeforeResize);
  }

  private handleHighlight(mouseX: number, mouseY: number): boolean {
    if (!environment.isHighlightingEnabled) {
      return false;
    }

    if (!this.readingState.section) {
      return false;
    }

    const selection = document.getSelection();
    const range = !!selection && !selection.isCollapsed ? selection.getRangeAt(0) : null;

    if (!selection || !range || range.collapsed) {
      if (this.isHighlightMenuOpen) {
        this.closeHighlightMenu();
        return true; // Prevent navigating when closing highlight menu
      } else if (this.selectedHighlight) {
        // Clicking existing highlight
        this.trackingService.event("openSelection");
        this.openHighlightMenu(mouseX, mouseY);
        return true; // Prevent navigating when opening existing highlight
      } else {
        return false;
      }
    }

    if (this.selectedHighlight) {
      // Clear current selection before selecting a new range
      this.selectedHighlight.setIsSelected(false);
      this.highlighter.updateHighlight(this.selectedHighlight);
      this.selectedHighlight = null;
    }

    const startLocation = this.readingState.getLocation(range.startContainer, range.startOffset);
    const endLocation = this.readingState.getLocation(range.endContainer, range.endOffset);

    if (startLocation === null || endLocation === null) {
      return false;
    }

    const highlight = this.highlighter.createHighlight(this.readingState.section, {
      startLocation: startLocation,
      endLocation: endLocation,
      isHighlighted: false,
      isUnderlined: false,
      text: range.toString(),
    });

    if (!highlight) {
      return false;
    }

    this.selectedHighlight = highlight;
    this.selectedHighlight.setIsSelected(true);

    this.openHighlightMenu(mouseX, mouseY);

    this.trackingService.event("newSelection");

    selection.removeAllRanges();

    return true;
  }

  private onHighlightClick(highlight: HighlightedText) {
    if (!this.selectedHighlight) {
      this.selectedHighlight = highlight;
      this.selectedHighlight.setIsSelected(true);
    }
  }

  private openHighlightMenu(x: number, y: number) {
    this.highlightMenuX = x;
    this.highlightMenuY = y;

    if (this.highlightMenuX + HighlightMenuWidth > this.bookContentElement!.clientWidth) {
      this.highlightMenuX -= HighlightMenuWidth;
    }

    if (this.highlightMenuY + HighlightMenuHeight > this.bookContentElement!.clientHeight) {
      this.highlightMenuY -= HighlightMenuHeight;
    }

    this.isHighlightMenuOpen = true;
  }

  private closeHighlightMenu() {
    this.updateHighlight();

    if (this.selectedHighlight) {
      this.selectedHighlight.setIsSelected(false);
      this.selectedHighlight = null;
    }

    if (this.isHighlightMenuOpen) {
      this.isHighlightMenuOpen = false;
      this.trackingService.event("closeSelection");
    }

    this.setInativeTimeout();
  }

  private async updateHighlight() {
    if (!this.selectedHighlight) {
      return;
    }

    await this.highlighter.updateHighlight(this.selectedHighlight);
  }

  private handleDebugKey(event: KeyboardEvent) {
    if (!environment.debug) {
      return;
    }

    if (!event.shiftKey || !event.key) {
      return;
    }

    // Debugging tools
    const key = event.key.toLowerCase();
    if (key !== 't') {
      return;
    }

    const selection = document.getSelection();

    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      return;
    }
    const start =
      this.readingState.getLocation(range.startContainer, range.startOffset);
    const end =
      this.readingState.getLocation(range.endContainer, range.endOffset);

    if (start === null || end === null) {
      return;
    }

    alert(`
Selection start: ${start}
Selection end: ${end}
Selection characters: ${end - start}

View words: ${this.readingState.wordCount}
View characters: ${this.readingState.characterCount}

Section characters: ${this.readingState.sectionCharacterCount}`
    );
  }

}
