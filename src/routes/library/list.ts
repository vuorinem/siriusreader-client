import { Router } from 'aurelia-router';
import { autoinject, PLATFORM } from 'aurelia-framework';

@autoinject
export class List {
  public constructor(private router: Router) {}
}
