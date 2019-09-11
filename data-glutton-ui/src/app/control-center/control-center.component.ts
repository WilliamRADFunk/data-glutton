import { Component, OnInit } from '@angular/core';
import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

@Component({
  selector: 'app-control-center',
  templateUrl: './control-center.component.html',
  styleUrls: ['./control-center.component.scss']
})
export class ControlCenterComponent implements OnInit {
  countries: string[] = [];
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: { [key: string]: boolean } = {
    airports: false,
    factbook: false,
    leaders: false,
  };
  /**
   * Flag to track if store initialization is underway.
   */
  isSeedingStore: { [key: string]: boolean } = {
    airports: false,
    countries: false,
    leaders: false,
  };

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnInit() {
  }

  flushStore() {
    // Dump the store and reset controls
  }

  async initScraping(type?: string): Promise<void> {
    if (Object.values(this.isScraping).some(k => !!k)) {
      return;
    }
    console.log('Fetching countries...');
    this.fetchService.fetchCountries().subscribe(countries => {
        console.log('Countries', countries);
        this.countries = countries.map(c => c.name);
      });
    if (!type) {
      // Scrape all sources
      await this.fetchService.runFactbookFetcher();
    } else {
      // Scrape selected source
    }
  }

  initStore(type?: string) {
    if  (Object.values(this.isSeedingStore).some(k => !!k)) {
      return;
    }
    if (!type) {
      // Seed store with all files
    } else {
      // Seed store with selected type
    }
  }

  async scrapeAll(): Promise<void> {
    // Scrape all the data
    await this.fetchService.fetchCountries();
    await this.fetchService.runFactbookFetcher();
  }

}
