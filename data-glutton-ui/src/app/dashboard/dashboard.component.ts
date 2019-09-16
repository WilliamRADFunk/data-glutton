import { Component, OnInit } from '@angular/core';
import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

export interface CountryReference {
  dataCode: string;
  isoCode: string;
  name: string;
  status: { factbook: number; leaders: number; };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  countries: CountryReference[] = [];
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: boolean = true;

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnInit() {
    console.log('Fetching countries...');
    this.fetchService.fetchCountries().subscribe(countries => {
      console.log('Countries', countries);
      this.countries = countries.slice();
      this.isScraping = false;
    });
  }

  private scrapeCountry(country: CountryReference): void {
    country.status.factbook = 1;
    this.fetchService.fetchCountry(country.name).toPromise()
      .then(done => {
        country.status.factbook = 2;
      })
      .catch(err => {
        country.status.factbook = -1;
      });
  }

  private scrapeLeadersOfCountry(country: CountryReference): void {
    country.status.leaders = 1;
    this.fetchService.fetchCountry(country.name).toPromise()
      .then(done => {
        country.status.leaders = 2;
      })
      .catch(err => {
        country.status.leaders = -1;
      });
  }

  public flushStore() {
    // Dump the store and reset controls
  }

  public isScrapingBusy(): boolean {
    return this.isScraping;
  }

  public scrapeAirports(): void {
    this.isScraping = true;
    this.isScraping = false;
  }

  public scrapeCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeCountry(country);
  }

  public scrapeFactbook(): void {
    this.isScraping = true;
    this.countries.filter(c => c.status.factbook === 0 || c.status.factbook === -1).forEach(country => {
      this.scrapeCountry(country);
    });
    this.isScraping = false;
  }

  public scrapeLeadersOfCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeLeadersOfCountry(country);
  }

  public scrapeLeaders(): void {
    this.isScraping = true;
    this.countries.filter(c => c.status.leaders === 0 || c.status.leaders === -1).forEach(country => {
      this.scrapeLeadersOfCountry(country);
    });
    this.isScraping = false;
  }
}
