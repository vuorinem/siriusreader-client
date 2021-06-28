import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate, DialogComponentDeactivate, DialogCloseError, DialogCloseResult } from 'aurelia-dialog';

@autoinject
export class InformationSheetDialog implements DialogComponentActivate<void>, DialogComponentDeactivate {

  private routerNavigationSubscription?: Subscription;

  constructor(
    private dialogController: DialogController,
    private eventAggregator: EventAggregator) {
  }

  public activate() {
    this.routerNavigationSubscription = this.eventAggregator.subscribe('router:navigation:success', () => {
      this.dialogController.cancel();
    });
  }

  public deactivate() {
    if (this.routerNavigationSubscription) {
      this.routerNavigationSubscription.dispose();
      this.routerNavigationSubscription = undefined;
    }
  }

}
