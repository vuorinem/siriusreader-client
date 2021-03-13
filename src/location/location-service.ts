import { UserService } from '../user/user-service';
import { ILocationPrompt } from './i-location-prompt';
import { autoinject } from "aurelia-framework";
import { json, HttpClient } from 'aurelia-fetch-client';

@autoinject
export class LocationService {

  constructor(
    private http: HttpClient,
    private userService: UserService) {
  }

  public async getLocations(): Promise<string[]> {
    const response = await this.http.fetch(`/location`);

    if (!response.ok) {
      throw Error('Error trying to load locations');
    }

    return response.json();
  }

  public async sendLocationPrompt(locationName: string): Promise<void> {
    const time = new Date();

    const location: ILocationPrompt = {
      location: locationName,
      time: time,
      timezoneOffset: time.getTimezoneOffset(),
    };

    const response = await this.http
      .fetch(`/location/prompt`, {
        method: 'post',
        body: json(location),
      });

    if (!response.ok) {
      throw new Error('Error sending location prompt answers');
    }
  }

  public async doNotPrompt(): Promise<void> {
    const response = await this.http
      .fetch(`/location/do-not-prompt`, {
        method: 'post',
      });

    if (!response.ok) {
      throw new Error('Error sending location prompt message');
    }

    this.userService.load();
  }
}
