import { autoinject, observable, TaskQueue } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { IBookDetails } from '../book/i-book-details';
import { LocationService } from './location-service';

@autoinject
export class LocationPromptDialog implements DialogComponentActivate<IBookDetails> {

  private locations: string[] = [];
  private showOther = false;

  @observable private otherInput?: HTMLInputElement;

  constructor(
    private dialogController: DialogController,
    private taskQueue: TaskQueue,
    private locationService: LocationService) {
  }

  public async activate() {
    this.locations = await this.locationService.getLocations();
  }

  public selectOther() {
    this.showOther = true;
  }

  public async send(selectedLocation: string) {
    if (!selectedLocation) {
      return;
    }

    await this.locationService.sendLocationPrompt(selectedLocation);
    this.dialogController.ok(selectedLocation);
  }

  public async skip() {
    this.dialogController.ok();
  }

  public async alwaysSkip() {
    this.dialogController.ok();
  }

  public otherInputChanged() {
    this.taskQueue.queueTask(() => {
      if (this.otherInput) {
        this.otherInput.focus();
      }
    });
  }
}
