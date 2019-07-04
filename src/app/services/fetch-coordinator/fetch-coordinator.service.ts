import { Injectable } from '@angular/core';

import { getCountries } from '../../utils/get-countries';
import { FactbookFetchService } from '../factbook-fetch/factbook-fetch.service';

@Injectable({
  providedIn: 'root'
})
export class FetchCoordinator {

  constructor(private readonly factbookFetch: FactbookFetchService) { }

  async fetchCountries(): Promise<void> {
    return await getCountries();
  }

  async runFactbookFetcher(): Promise<void> {
    return await this.factbookFetch.fetchFactbookData();
  }
}
