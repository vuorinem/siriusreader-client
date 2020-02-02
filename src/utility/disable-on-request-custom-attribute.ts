import { Disposable } from 'aurelia-binding';
import { HttpClient } from 'aurelia-fetch-client';
import { autoinject, BindingEngine } from 'aurelia-framework';

@autoinject
export class DisableOnRequestCustomAttribute {
  private observer: Disposable;

  constructor(
    private element: Element,
    private bindingEngine: BindingEngine,
    private http: HttpClient) {
    this.observer = this.bindingEngine.propertyObserver(this.http, 'isRequesting')
      .subscribe(() => {
        if (this.http.isRequesting) {
          this.element.setAttribute('disabled', 'disabled');
        } else {
          this.element.removeAttribute('disabled');
        }
      });
  }

}
