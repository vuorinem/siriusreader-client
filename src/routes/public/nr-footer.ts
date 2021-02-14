import { AuthService } from './../../auth/auth-service';
import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject
export class NrFooter {
  constructor(
    private router: Router,
    private authService: AuthService) {
  }
}
