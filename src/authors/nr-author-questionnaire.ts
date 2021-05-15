import { HttpClient } from 'aurelia-fetch-client';
import { AuthorService } from './author-service';
import { ComponentAttached, autoinject, ComponentDetached } from 'aurelia-framework';

@autoinject
export class NrAuthorQuestionnaire implements ComponentAttached, ComponentDetached {
  private authors: string[] = [];
  private selectedAuthors: string[] = [];

  private onBeforeUnload = (event: Event) => this.handleBeforeUnload(event);

  constructor(
    private element: Element,
    private http: HttpClient,
    private authorService: AuthorService) {
  }

  public async attached() {
    this.authors = await this.authorService.getAuthors();

    window.addEventListener('beforeunload', this.onBeforeUnload, false);
  }

  public detached() {
    window.removeEventListener('beforeunload', this.onBeforeUnload, false);
  }

  private async submit() {
    await this.authorService.saveAnswers(this.selectedAuthors);

    const submitEvent = new CustomEvent('submitted', {
      bubbles: false,
      cancelable: false,
    });

    this.element.dispatchEvent(submitEvent);
  }

  private handleBeforeUnload(event: Event) {
    event.preventDefault();
    event.returnValue = false;
  }
}
