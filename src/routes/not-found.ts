import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject
export class NotFound {
  constructor(private router: Router) {
  }

  public activate() {
    this.router.navigate("/");
  }
}
