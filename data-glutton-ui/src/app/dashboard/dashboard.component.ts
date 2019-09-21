import { Component, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';
import { Subscription } from 'rxjs';

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
export class DashboardComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  airportSources: AirportSpurceReference[] [];
  countries: CountryReference[] = [];
  dashboard: { [key: string]: { [key: string]: number } } = {
    'Airports/Helo': {},
    'Factbook': {},
    'World Leader': {}
  };
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: boolean = true;
  selected: string = 'factbook';

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnDestroy(): void {
    this._subs.forEach(s => s && s.unsubscribe());
    this._subs.length = 0;
  }

  ngOnInit(): void {
    this.fetchService.fetchCountries()
      .pipe(take(1))
      .subscribe(countries => {
        this.countries = countries.slice();
        this.isScraping = false;
    });
    this._subs.push(
      this.fetchService.fetchDashboard()
        .subscribe(data => {
          this.dashboard = data.dashboard;
      }));
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

  public flushStore(): void {
    this.fetchService.flushEntities().pipe(take(1)).subscribe();
    this.fetchService.fetchCountries()
      .pipe(take(1))
      .subscribe(countries => {
        this.countries = countries.slice();
        this.isScraping = false;
    });
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

  public getDashboardFragment(dataSource: string, iteration: number): { [key: string]: number } {
    const keyCount = this.getDashboardKeyCount(dataSource);
    const indexStart = Number(iteration) * LIST_SIZE;
    const indexEnd = (indexStart + LIST_SIZE) > keyCount ? keyCount : indexStart + LIST_SIZE;
    const relevantKeys = Object.keys(this.dashboard[dataSource]).slice(indexStart, indexEnd);
    const dashboardFragment = {};
    relevantKeys.forEach(key => {
      dashboardFragment[key] = this.dashboard[dataSource][key];
    });
    return dashboardFragment;
  }

  public getDashboardKeyCount(dataSource: string): number {
    return Object.keys(this.dashboard[dataSource]).length;
  }

  public getDashboardKeys(): string[] {
    return Object.keys(this.dashboard);
  }

  public getListNumber(dataSource: string): number[] {
    const keyCount = this.getDashboardKeyCount(dataSource);
    const numOfListsBase = Math.floor(keyCount / LIST_SIZE);
    const carryOver = (keyCount % LIST_SIZE) ? 1 : 0;
    const total =  numOfListsBase + carryOver;
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
