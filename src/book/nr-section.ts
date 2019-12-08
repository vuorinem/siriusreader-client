import { Highlighter } from './../reading/highlighter';
import { Disposable } from 'aurelia-binding';
import { SectionModel } from './section-model';
import { autoinject, BindingEngine } from 'aurelia-framework';
import { BookService } from './book-service';
import { bindable } from 'aurelia-framework';

@autoinject
export class NrSection {
    @bindable private section!: SectionModel;
    private element: HTMLElement;

    private shouldLoadObserver?: Disposable;

    constructor(
        element: Element,
        private bindingEngine: BindingEngine,
        private bookService: BookService,
        private highlighter: Highlighter) {

        this.element = element as HTMLElement;
    }

    public bind() {
        this.section.element = this.element;

        this.shouldLoadObserver = this.bindingEngine
            .propertyObserver(this.section, 'shouldLoad')
            .subscribe(() => this.shouldLoadChanged());
    }

    public unbind() {
        if (this.shouldLoadObserver) {
            this.shouldLoadObserver.dispose();
        }
    }

    public attached() {
        this.update();
    }

    public detached() {
        this.clear();
    }

    private shouldLoadChanged() {
        this.update();
    }

    private update() {
        if (!this.section.shouldLoad) {
            this.clear();
            return;
        }

        if (this.section.isLoaded) {
            return;
        }

        this.load();
    }

    private clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild)
        }

        this.section.isLoaded = false;
    }

    private async load() {
        if (!this.section.url) {
            return;
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

            return;
        }

        this.section.refreshWidth();

        this.section.isLoading = false;
        this.section.isLoaded = true;

        this.highlighter.showSectionHighlights(this.section);
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
