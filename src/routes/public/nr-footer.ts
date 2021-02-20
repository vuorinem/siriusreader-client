import { AuthService } from './../../auth/auth-service';
import { Router } from 'aurelia-router';
import { autoinject, bindable } from 'aurelia-framework';

@autoinject
export class NrFooter {
  @bindable router!: Router;
  
  constructor(
    private authService: AuthService) {
  }
}
