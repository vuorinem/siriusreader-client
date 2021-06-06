import { autoinject } from 'aurelia-framework';
import { LibraryService } from './library-service';

@autoinject
export class NrTitleCoverCustomAttribute {
  private element: HTMLImageElement;
  private value!: string;

  constructor(
    element: Element,
    private libraryService: LibraryService) {

    this.element = element as HTMLImageElement;
  }

  public bind() {
    this.loadImage(parseInt(this.value));
  }

  public valueChanged() {
    this.loadImage(parseInt(this.value));
  }

  private async loadImage(bookId?: number) {
    this.element.src = "";

    if (!bookId) {
      return;
    }

    const blob = await this.libraryService.getCoverImage(bookId);

    await this.setImgSrc(this.element, URL.createObjectURL(blob));
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
}
