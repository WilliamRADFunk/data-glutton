import { Component, OnInit } from '@angular/core';
import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

@Component({
  selector: 'app-control-center',
  templateUrl: './control-center.component.html',
  styleUrls: ['./control-center.component.scss']
})
export class ControlCenterComponent implements OnInit {
  countries: { dataCode: string; isoCode: string; name: string; status: number; }[] = [];
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: { [key: string]: boolean } = {
    airports: false,
    factbook: true,
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
    console.log('Fetching countries...');
    this.fetchService.fetchCountries().subscribe(countries => {
      console.log('Countries', countries);
      this.countries = countries.slice();
      this.isScraping.factbook = false;
    });
  }

  flushStore() {
    // Dump the store and reset controls
  }

  public async initScraping(type?: string): Promise<void> {
    if (Object.values(this.isScraping).some(k => !!k)) {
      return;
    }
    
    if (!type) {
      // Scrape all sources
      this.fetchService.runFactbookFetcher().then(done => {
        console.log('done', done);
      }).catch(err => {
        console.error('initScraping Error: ', err);
      });
    } else {
      // Scrape selected source
      switch(type) {
        case 'factbook': {
          this.isScraping.factbook = true;
          break;
        }
      }
    }
  }

  public initStore(type?: string) {
    if  (Object.values(this.isSeedingStore).some(k => !!k)) {
      return;
    }
    if (!type) {
      // Seed store with all files
    } else {
      // Seed store with selected type
    }
  }

  public isScrapingBusy(): boolean {
    return Object.values(this.isScraping).some(k => !!k);
  }

  public async scrapeAll(): Promise<void> {
    // Scrape all the data
    await this.fetchService.fetchCountries();
    await this.fetchService.runFactbookFetcher();
  }

  public scrapeCountry(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    country.status = 1;
    this.fetchService.fetchCountry(countryName).toPromise()
      .then(done => {
        country.status = 2;
      })
      .catch(err => {
        country.status = -1;
      });
  }

  public scrapeFactbook(): void {

  }

}
