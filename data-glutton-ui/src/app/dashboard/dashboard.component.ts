import { Component, OnDestroy, OnInit } from '@angular/core';
import { take, catchError } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';
import { Subscription, of } from 'rxjs';
import { AirportSourceReference } from '../models/airport-source-reference';
import { CountryReference } from '../models/country-reference';

const LIST_SIZE = 5;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  airportSources: AirportSourceReference[] = [];
  countries: CountryReference[] = [];
  dashboard: { [key: string]: { [key: string]: number } } = {
    'Airport/Helo': {},
    'Factbook': {},
    'World Leader': {}
  };
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: boolean = true;
  scrapeKeys: { label: string; hasSubResources: boolean; }[] = [
    {
      label: 'CIA World Factbook',
      hasSubResources: false
    },
    {
        label: 'CIA World Leaders',
        hasSubResources: false
    },
    {
      label: 'Airports/Helos',
      hasSubResources: true
    }
  ];
  selected: string = 'CIA World Factbook';

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
    this.fetchService.fetchAirportHelos()
      .pipe(take(1))
      .subscribe(airportsHelos => {
        this.airportSources = airportsHelos.slice();
        this.airportSources.forEach(source => {
        this.reassignStatus(source);
      });
    });
    this._subs.push(
      this.fetchService.fetchDashboardStream()
        .pipe(catchError(err => {
          console.error('fetchDashboardStream error: ', err.message);
          return of(this.dashboard);
        }))
        .subscribe(data => {
          this.dashboard = data.dashboard;
      }));
  }

  private async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  private reassignStatus(source: any): void {
    if (source.subRefs.some(sub => sub.status === 1)) {
      source.status = 1;
    } else if (source.subRefs.some(sub => sub.status === -1)) {
      source.status = -1;
    } else if (source.subRefs.every(sub => sub.status === 2)) {
      source.status = 2;
    } else {
      source.status = 0;
    }
  }

  private scrapeAirportHeloSource(source: AirportSourceReference): void {
    console.log('source.status', source, source.status);
    this.reassignStatus(source);
    if (source.status !== -1 && source.status !== 0) {
      return;
    }
    source.status = 1;
    if (source.name !== 'Airports') {
      if (source.status === -1 || source.status === 0) {
        this.fetchService.fetchAirportHeloSource(source.name).toPromise()
          .then(done => {
            source.status = 2;
            this.reassignStatus(source);
          })
          .catch(err => {
            source.status = -1;
            this.reassignStatus(source);
          });
      }
    } else {
      const start = async () => {
        await this.asyncForEach(source.subRefs, async (sub) => {
          await this.fetchService.fetchDashboard().toPromise()
            .then(data => {
              this.dashboard = data.dashboard;
            })
            .catch(err => {
              console.log('fetchDashboard error: ', err.message);
            });
          if (sub.status === -1 || sub.status === 0) {
            sub.status = 1;
            this.reassignStatus(source);
            await this.fetchService.fetchAirportHeloSource(source.name, sub.name).toPromise()
              .then(done => {
                sub.status = 2;
                this.reassignStatus(source);
              })
              .catch(err => {
                sub.status = -1;
                this.reassignStatus(source);
              });
          }
        });
      }
      // Creates an asyncronous version of the forEach loop.
      start();
    }
  }

  private scrapeCountry(country: CountryReference): void {
    country.status['CIA World Factbook'] = 1;
    this.fetchService.fetchCountry(country.name).toPromise()
      .then(done => {
        country.status['CIA World Factbook'] = 2;
      })
      .catch(err => {
        country.status['CIA World Factbook'] = -1;
      });
  }

  private scrapeLeadersOfCountry(country: CountryReference): void {
    country.status['CIA World Leaders'] = 1;
    this.fetchService.fetchLeaders(country.name).toPromise()
      .then(done => {
        country.status['CIA World Leaders'] = 2;
      })
      .catch(err => {
        country.status['CIA World Leaders'] = -1;
      });
  }

  public async flushStore(): Promise<void> {
    this.fetchService.flushEntities().pipe(take(1)).subscribe();
    await this.fetchService.fetchAirportHelos()
      .toPromise()
        .then(airportsHelos => {
          this.airportSources = airportsHelos.slice();
        });
    await this.fetchService.fetchCountries()
      .toPromise()
      .then(countries => {
        this.countries = countries.slice();
        this.selected = 'CIA World Factbook';
        this.isScraping = false;
      });
  }

  public getAlertStatus(dataSource: string, isAirportHelos?: boolean): {'alert-info': boolean; 'alert-warning': boolean; 'alert-danger': boolean; } {
    const isBusy = this.isScrapingBusy(dataSource, isAirportHelos);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource, isAirportHelos);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource, isAirportHelos);
    return {
      'alert-info': infoMode,
      'alert-warning': isBusy,
      'alert-danger': hasErrors
    };
  }

  public getButtonStatus(dataSource: string, isAirportHelos?: boolean): { info: boolean; warning: boolean; danger: boolean; } {
    const isBusy = this.isScrapingBusy(dataSource, isAirportHelos);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource, isAirportHelos);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource, isAirportHelos);
    console.log('getButtonStatus', dataSource, isAirportHelos, isBusy, hasErrors, infoMode);
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

  public getSubSource(dataSource: AirportSourceReference): AirportSourceReference[] {
    const ref = this.airportSources.find(s => s.name === dataSource.name);
    return ref.subRefs;
  }

  public hasFailedStatus(datasource: string, isAirportHelos?: boolean): boolean {
    if (isAirportHelos) {
      return this.airportSources.some(a => a.status === -1 || a.subRefs.some(sub => sub.status === -1));
    } else {
      return this.countries.some(c => c.status[datasource] === -1);
    }
  }

  public isComplete(datasource: string, isAirportHelos?: boolean): boolean {
    if (isAirportHelos) {
      return !this.airportSources.every(a => a.status === 2 || a.subRefs.every(sub => sub.status === 2));
    } else {
      return !this.countries.every(c => c.status[datasource] === 2);
    }
  }

  public isScrapingBusy(datasource: string, isAirportHelos?: boolean): boolean {
    if (isAirportHelos) {
      return this.isScraping || this.airportSources.some(a => a.subRefs.some(sub => sub.status === 1));
    } else {
      return this.isScraping || this.countries.some(c => c.status[datasource] === 1);
    }
  }

  public scrapeAirportHeloSourceByName(source: string): void {
    const airportHeloSource = this.airportSources.find(s => s.name === source);
    this.scrapeAirportHeloSource(airportHeloSource);
  }

  public scrapeCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeCountry(country);
  }

  public scrape(dataSource: string): void {
    this.isScraping = true;
    switch(dataSource) {
      case 'CIA World Factbook': {
        this.countries.filter(c => c.status['CIA World Factbook'] === 0 || c.status['CIA World Factbook'] === -1).forEach(country => {
          this.scrapeCountry(country);
        });
        break;
      }
      case 'CIA World Leaders': {
        this.countries.filter(c => c.status['CIA World Leaders'] === 0 || c.status['CIA World Leaders'] === -1).forEach(country => {
          this.scrapeLeadersOfCountry(country);
        });
        break;
      }
      case 'Airports/Helos': {
        this.airportSources.filter(c => c.status === 0 || c.status === -1).forEach(source => {
          this.scrapeAirportHeloSource(source);
        });
        break;
      }
    }

    this.isScraping = false;
  }

  public scrapeLeadersOfCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeLeadersOfCountry(country);
  }

  public switchSelected(dataSource: string): void {
    this.selected = dataSource;
    if (dataSource === 'Airports/Helos') {
      console.log('Switched!', dataSource);
      this.reassignStatus(this.airportSources[0]);
    }
  }
}
