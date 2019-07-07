import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FactbookFetchService } from '../factbook-fetch/factbook-fetch.service';

@Injectable({
  providedIn: 'root'
})
export class FetchCoordinator {

  constructor(
    private readonly factbookFetch: FactbookFetchService,
    private readonly http: HttpClient) { }

  fetchCountries(): Observable<any> {
    return this.http.get('http://localhost:3000/countries');
  }

  async runFactbookFetcher(): Promise<void> {
    return await this.factbookFetch.fetchFactbookData();
  }
}
