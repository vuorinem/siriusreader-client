import { autoinject } from 'aurelia-framework';
import { IBookmark } from './i-bookmark';
import { HttpClient, json } from 'aurelia-fetch-client';
import { IHighlight } from './i-highlight';

@autoinject
export class ReadingService {

    constructor(private http: HttpClient) {
    }

    public async getLocation(): Promise<number> {
        const response = await this.http.fetch(`/book/selected/bookmark`);

        const bookmark: IBookmark = await response.json();

        return bookmark.location;
    }

    public async setLocation(location: number | undefined) {
        if (location) {
            this.http.fetch(`/book/selected/bookmark`, {
                body: json(<IBookmark>{
                    location: location,
                }),
                method: 'post',
            });
        } else {
            this.http.fetch(`/book/selected/bookmark`, {
                method: 'delete',
            });
        }
    }

    public async getHighlights(): Promise<IHighlight[]> {
        const response = await this.http.fetch(`/book/selected/highlight`);

        return response.json();
    }

    public async setHighlight(highlight: IHighlight): Promise<IHighlight> {
        const response = await this.http.fetch(`/book/selected/highlight`, {
            body: json(highlight),
            method: 'post',
        });

        return response.json();
    }

    public async deleteHighlight(highlight: IHighlight): Promise<void> {
        await this.http.fetch(`/book/selected/highlight/${highlight.highlightId}`, {
            method: 'delete',
        });
    }

}
