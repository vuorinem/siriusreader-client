import { IObservable, NavigationInstruction, RoutableComponentActivate, RouteConfig } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';
import { LibraryService } from './library-service';
import { ITitle } from './i-title';

@autoinject
export class List implements RoutableComponentActivate {
  private titles: ITitle[] = [];

  public constructor(
    private libraryService: LibraryService) {
  }

  public async activate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction) {
    this.titles = await this.libraryService.getTitles();
  }
}
