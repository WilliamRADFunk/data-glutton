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

  private scrapeCountry(country: { dataCode: string; isoCode: string; name: string; status: number; }): void {
    country.status = 1;
    this.fetchService.fetchCountry(country.name).toPromise()
      .then(done => {
        country.status = 2;
      })
      .catch(err => {
        country.status = -1;
      });
  }

  public flushStore() {
    // Dump the store and reset controls
  }

  public isScrapingBusy(): boolean {
    return Object.values(this.isScraping).some(k => !!k);
  }

  public scrapeCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeCountry(country);
  }

  public scrapeFactbook(): void {
    this.countries.forEach(country => {
      this.scrapeCountry(country);
    });
  }

}
