import { autoinject } from 'aurelia-framework';
import { DialogController, DialogComponentActivate } from 'aurelia-dialog';
import { IBookDetails } from '../book/i-book-details';
import { LocationService } from './location-service';

@autoinject
export class LocationPromptDialog implements DialogComponentActivate<IBookDetails> {

  private locations: string[] = [];

  constructor(
    private dialogController: DialogController,
    private locationService: LocationService) {
  }

  public async activate() {
    this.locations = await this.locationService.getLocations();
  }

  public async send(selectedLocation: string) {
    await this.locationService.sendLocationPrompt(selectedLocation);
    this.dialogController.ok();
  }

}
