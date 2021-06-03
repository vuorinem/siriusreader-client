import { NrSection } from './nr-section';
import { computedFrom } from 'aurelia-framework';

export class SectionModel {
  public element!: HTMLElement;
  public viewModel!: NrSection;
  public url: string;
  public characters: number;
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  public isHidden: boolean = false;
  public startLocation: number = 0;
  public endLocation: number = 0;

  public previousSection?: SectionModel;
  public nextSection?: SectionModel;

  public pageWidth?: number;

  public columnCount: number = 1;

  private internalLeft: number = 0;
  private width: number = 0;

  @computedFrom('internalLeft')
  public get left(): number {
    return this.internalLeft;
  }

  @computedFrom('left', 'width')
  public get right(): number {
    return this.left + this.width;
  }

  @computedFrom('width', 'pageWidth')
  public get pageCount(): number {
    if (!this.pageWidth) {
      return 0;
    }

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

  public async load() {
    await this.viewModel.load();
  }

  public unload() {
    this.viewModel.clear();
  }

  public moveTo(newLeft: number) {
    if (newLeft != this.internalLeft) {
      this.internalLeft = newLeft;
      this.refreshNextSection();
    }
  }

  public refreshWidth() {
    if (!this.pageWidth) {
      return;
    }

    const oldWidth = this.width;

    if (!this.element?.firstElementChild) {
      this.width = this.pageWidth;
      this.refreshNextSection();
      return;
    }

    let newWidth = this.getWidth(this.element);

    // Make sure the width is a multiple of page width
    const widthOverflow = newWidth % this.pageWidth;
    if (widthOverflow > 0.1) {
      newWidth += this.pageWidth - widthOverflow;
    }

    if (oldWidth !== newWidth) {
      this.width = newWidth;
      this.refreshNextSection();
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

    if (right === null || left === null) {
      return 0;
    }

    return right - left;
  }

  private refreshNextSection() {
    if (this.nextSection) {
      this.nextSection.moveTo(this.right);
    }
  }
}
