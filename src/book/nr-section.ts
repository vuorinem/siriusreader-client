import { Highlighter } from './../reading/highlighter';
import { SectionModel } from './section-model';
import { autoinject } from 'aurelia-framework';
import { BookService } from './book-service';
import { bindable } from 'aurelia-framework';

@autoinject
export class NrSection {
  @bindable private section!: SectionModel;
  private element: HTMLElement;

  constructor(
    element: Element,
    private bookService: BookService,
    private highlighter: Highlighter) {

    this.element = element as HTMLElement;
  }

  public bind() {
    this.section.element = this.element;
    this.section.viewModel = this;
  }

  public detached() {
    this.clear();
  }

  public clear() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }

    this.section.isLoaded = false;
  }

  public async load(): Promise<boolean> {
    if (!this.section.url || this.section.isLoaded || this.section.isLoading) {
      return false;
    }

    this.section.isLoading = true;

    const sectionNodes = await this.bookService.getSection(this.section.url);

    const loaderPromises: Promise<void>[] = [];

    while (sectionNodes.length > 0) {
      const node = sectionNodes.item(0);

      loaderPromises.push(...this.replaceContent(node!));

      this.element.appendChild(node!);
    }

    await Promise.all(loaderPromises);

    if (!this.element.lastElementChild || !this.element.firstElementChild) {
      this.section.isLoading = false;

      return false;
    }

    this.section.refreshWidth();

    this.section.isLoading = false;
    this.section.isLoaded = true;

    this.highlighter.showSectionHighlights(this.section);

    return true;
  }

  private replaceContent(node: Node): Promise<void>[] {
    const loadPromises: Promise<void>[] = [];

    if (node instanceof HTMLImageElement) {
      loadPromises.push(this.replaceImageSrcWithBlobUrl(node));
    } else if (node instanceof HTMLAnchorElement) {
      this.checkForLink(node);
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      loadPromises.push(...this.replaceContent(node.childNodes.item(i)));
    }

    return loadPromises;
  }

  private async replaceImageSrcWithBlobUrl(img: HTMLImageElement) {
    // Get original src without baseUrl
    const imageSrc = img.getAttribute("src");

    if (!imageSrc) {
      return;
    }

    // Clear node src to prevent trying to load wrong url
    img.src = "";

    const blob = await this.bookService.getImage(imageSrc);

    await this.setImgSrc(img, URL.createObjectURL(blob));
  }

  private async setImgSrc(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const onImgLoaded = () => {
        img.removeEventListener('load', onImgLoaded);

        resolve();
      };

      img.addEventListener('load', onImgLoaded);

      img.src = src;
    });
  }

  private checkForLink(a: HTMLAnchorElement) {
    const href = a.getAttribute('href');

    if (!href) {
      return;
    }

    a.removeAttribute('href');
  }
}
