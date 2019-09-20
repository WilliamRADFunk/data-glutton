import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

export interface AirportSpurceReference {
  name: string;
  status: number;
}

export interface CountryReference {
  dataCode: string;
  isoCode: string;
  name: string;
  status: { airports: number; factbook: number; leaders: number; };
}

const LIST_SIZE = 5;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  airportSources: AirportSpurceReference[] [];
  countries: CountryReference[] = [];
  dashboard: { [key: string]: { [key: string]: number } };
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: boolean = true;
  selected: string = 'factbook';

  constructor(private readonly fetchService: FetchCoordinator) { }

  async ngOnInit(): Promise<void> {
    console.log('Fetching countries...');
    await this.fetchService.fetchCountries().toPromise().then(countries => {
      console.log('Countries', countries);
      this.countries = countries.slice();
      this.isScraping = false;
    });
    this.fetchService.fetchDashboard().subscribe(data => {
      this.dashboard = data.dashboard;
      console.log('~~~', this.dashboard);
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
    this.fetchService.fetchLeaders(country.name).toPromise()
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

  public getAlertStatus(dataSource: string): {'alert-info': boolean; 'alert-warning': boolean; 'alert-danger': boolean; } {
    const isBusy = this.isScrapingBusy(dataSource);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource);
    return {
      'alert-info': infoMode,
      'alert-warning': isBusy,
      'alert-danger': hasErrors
    };
  }

  public getButtonStatus(dataSource: string): { info: boolean; warning: boolean; danger: boolean; } {
    const isBusy = this.isScrapingBusy(dataSource);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource);
    return {
      info: infoMode,
      warning: isBusy,
      danger: hasErrors
    };
  }

  public getDashboard(dataSource: string): { [key: string]: number } {
    return (this.dashboard && this.dashboard[dataSource]) || {};
  }

  public getDashboardFragment(dataSource: string, iteration: number): { [key: string]: number } {
    const keyCount = this.getDashboardKeyCount(dataSource);
    const dashboard = this.getDashboard(dataSource);
    const indexStart = iteration * LIST_SIZE;
    const indexEnd = (indexStart + LIST_SIZE) > keyCount ? keyCount : iteration + LIST_SIZE;
    const relevantKeys = Object.keys(dashboard).slice(indexStart, indexEnd);
    const dashboardFragment = {};
    relevantKeys.forEach(key => {
      dashboardFragment[key] = dashboard[key];
    });
    console.log('dashboardFragment', dashboardFragment);
    return dashboardFragment;
  }

  public getDashboardKeyCount(dataSource: string): number {
    return Object.keys(this.getDashboard(dataSource)).length;
  }

  public getListNumber(dataSource: string): number[] {
    const keyCount = this.getDashboardKeyCount(dataSource);
    const numOfListsBase = Math.floor(keyCount / LIST_SIZE);
    const carryOver = (keyCount % LIST_SIZE) ? 1 : 0;
    const total =  numOfListsBase + carryOver;
    console.log('total', total);
    return new Array(total);
  }

  public hasFailedStatus(datasource: string): boolean {
    return this.countries.some(c => c.status[datasource] === -1);
  }

  public isComplete(datasource: string): boolean {
    return !this.countries.every(c => c.status[datasource] === 2);
  }

  public isScrapingBusy(datasource: string): boolean {
    return this.isScraping || this.countries.some(c => c.status[datasource] === 1);
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

  public switchSelected(dataSource: string): void {
    this.selected = dataSource;
  }
}
