import { observable, computedFrom } from 'aurelia-framework';

export class SectionModel {
  public element!: HTMLElement;
  public url: string;
  public characters: number;
  public shouldLoad: boolean = false;
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  public startLocation: number = 0;
  public endLocation: number = 0;

  public previousSection?: SectionModel;
  public nextSection?: SectionModel;

  public pageWidth?: number;
  @observable public left: number = 0;

  public columnCount: number = 1;

  private width: number = 0;

  @computedFrom('left', 'width')
  public get right(): number {
    return this.left + this.width;
  }

  @computedFrom('width', 'pageWidth')
  public get pageCount(): number {
    return Math.ceil(this.width / this.pageWidth);
  }

  constructor({ url, characters, previousSection }: { url: string, characters: number, previousSection?: SectionModel }) {
    this.url = url;
    this.characters = characters;
    this.previousSection = previousSection;

    if (previousSection) {
      previousSection.nextSection = this;
    }
  }

  public refreshWidth() {
    if (!this.pageWidth) {
      return;
    }

    if (!this.element.firstElementChild) {
      this.width = this.pageWidth;

      return;
    }

    const oldWidth = this.width;
    let newWidth = this.getWidth(this.element);

    // Make sure the width is a multiple column width
    const columnWidth = this.pageWidth / this.columnCount;
    const widthOverflow = newWidth % columnWidth;
    if (widthOverflow > 0.1) {
      newWidth += columnWidth - widthOverflow;
    }

    if (oldWidth !== newWidth) {
      this.width = newWidth;

      this.moveNextSection(newWidth - oldWidth);
    }
  }

  private getWidth(element: Element): number {
    let left: number | null = null;
    let right: number | null = null;

    let child = element.firstElementChild;

    while (child !== null) {
      const rect = child.getBoundingClientRect();
      child = child.nextElementSibling;

      if (rect.width === 0) {
        continue;
      }

      if (left === null || rect.left < left) {
        left = rect.left;
      }

      if (right === null || rect.right > right) {
        right = rect.right;
      }
    }

    return right - left;
  }

  private leftChanged(newLeft: number, oldLeft: number) {
    if (oldLeft === undefined) {
      this.moveNextSection(newLeft);
    } else {
      this.moveNextSection(newLeft - oldLeft);
    }
  }

  private moveNextSection(moveBy: number) {
    if (this.nextSection) {
      this.nextSection.left += moveBy;
    }
  }
}
