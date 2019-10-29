import { Component, OnDestroy, OnInit } from '@angular/core';
import { take, catchError } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';
import { SubResourceReference } from '../models/sub-resource-reference';
import { CountryReference } from '../models/country-reference';

export interface AlertStatus {
  info: boolean;
  warning: boolean;
  danger: boolean;
}

export interface AlertStatusStyle {
  'alert-info': boolean;
  'alert-warning': boolean;
  'alert-danger': boolean;
}

const LIST_SIZE = 5;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  activeOntFormat: string = 'both';
  countries: CountryReference[] = [];
  dashboard: { [key: string]: { [key: string]: number } } = {
    'Factbook': {},
    'Ports & Related': {},
    'World Leader': {}
  };
  downloadable: boolean = true;
  exportOptions: { [key: string]: { [key: string]: boolean } } = {
    'Factbook': {},
    'Ontologies': { 'Download Ontologies': false },
    'Ports & Related': {},
    'World Leader': {}
  };
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: boolean = true;
  portsAndRelated: SubResourceReference[] = [];
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
      label: 'Ports & Related',
      hasSubResources: false
    }
  ];
  selected: string = 'CIA World Factbook';
  selectedFileCount: number = 0;

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
    this.fetchService.fetchSubResources()
      .pipe(take(1))
      .subscribe(portsAndRelated => {
        this.portsAndRelated = portsAndRelated.slice();
        this.portsAndRelated.forEach(source => {
          this.reassignStatusWithSubResources(source);
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
          Object.keys(this.dashboard).forEach((majorKey: string) => {
            Object.keys(this.dashboard[majorKey]).forEach((minorKey: string) => {
              if (this.exportOptions[majorKey.toString()][minorKey] === undefined) {
                this.exportOptions[majorKey][minorKey] = false;
              }
            });
          });
      }));
  }

  private async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  private countSelectedFiles(): void {
    this.selectedFileCount = 0;
    Object.keys(this.exportOptions).forEach((majorKey: string) => {
      Object.keys(this.exportOptions[majorKey]).forEach((minorKey: string) => {
        if (this.exportOptions[majorKey][minorKey] === true) {
          this.selectedFileCount++;
        }
      });
    });
  }

  private reassignStatusWithSubResources(source: SubResourceReference): void {
    if (source.subRefs.some(sub => sub.status === 1)) {
      source.status = 1;
    } else if (source.subRefs.some(sub => sub.status === -1)) {
      source.status = -1;
    } else if (source.subRefs.every(sub => sub.status === 2)) {
      source.status = 2;
    } else if (source.subRefs.some(sub => sub.status === 0)) {
      source.status = 0;
    }
  }

  private scrapePortSource(source: SubResourceReference): void {
    this.reassignStatusWithSubResources(source);
    if (source.status !== -1 && source.status !== 0) {
      return;
    }
    source.status = 1;
    const start = async () => {
      await this.asyncForEach(source.subRefs, async (sub) => {
        await this.fetchService.fetchDashboard().toPromise()
          .then(data => {
            this.dashboard = data.dashboard;
          })
          .catch(err => {
            console.error('fetchDashboard error: ', err.message);
          });
        if (sub.status === -1 || sub.status === 0) {
          sub.status = 1;
          this.reassignStatusWithSubResources(source);
          await this.fetchService.fetchSubResource(source.name, sub.name).toPromise()
            .then(done => {
              sub.status = 2;
              this.reassignStatusWithSubResources(source);
            })
            .catch(err => {
              sub.status = -1;
              this.reassignStatusWithSubResources(source);
            });
        }
      });
    };
    // Creates an asyncronous version of the forEach loop.
    start();
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

  public download(): void {
    this.downloadable = false;
    let files = this.exportOptions.Ontologies['Download Ontologies'] ? 'ont:' : '';
    Object.keys(this.exportOptions).forEach(majorKey => {
      Object.keys(this.exportOptions[majorKey]).forEach(minorKey => {
        if (this.exportOptions[majorKey][minorKey]) {
          files += `${minorKey},`;
        }
      });
    });
    this.fetchService.saveFiles(files)
      .pipe(take(1))
      .subscribe(() => {
        const element = document.createElement('a');
        element.setAttribute('href', 'assets/data-glutton.zip');
        element.setAttribute('download', 'data-glutton.zip');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        this.downloadable = true;
      });
  }

  public exportAll(key: string): void {
    if (key) {
      Object.keys(this.exportOptions[key]).forEach(expOptKey => {
        this.exportOptions[key][expOptKey] = true;
      });
    } else {
      Object.keys(this.exportOptions).forEach(majorKey => {
        Object.keys(this.exportOptions[majorKey]).forEach(minorKey => {
          this.exportOptions[majorKey][minorKey] = true;
        });
      });
      this.exportOptions.Ontologies['Download Ontologies'] = true;
    }
    this.countSelectedFiles();
  }

  public exportNone(key?: string): void {
    if (key) {
      Object.keys(this.exportOptions[key]).forEach(expOptKey => {
        this.exportOptions[key][expOptKey] = false;
      });
    } else {
      Object.keys(this.exportOptions).forEach(majorKey => {
        Object.keys(this.exportOptions[majorKey]).forEach(minorKey => {
          this.exportOptions[majorKey][minorKey] = false;
        });
      });
      this.exportOptions.Ontologies['Download Ontologies'] = false;
    }
    this.countSelectedFiles();
  }

  public exportSelectChange(majorKey: string, minorKey: string, e: Event): void {
    e.stopPropagation();
    this.exportOptions[majorKey][minorKey] = !this.exportOptions[majorKey][minorKey];
    this.countSelectedFiles();
  }

  public async flushStore(): Promise<void> {
    this.fetchService.flushEntities().pipe(take(1)).subscribe();
    await this.fetchService.fetchSubResources()
      .toPromise()
        .then(subResource => {
          this.portsAndRelated = subResource.slice();
          this.portsAndRelated.forEach(source => {
            this.reassignStatusWithSubResources(source);
          });
        });
    await this.fetchService.fetchCountries()
      .toPromise()
      .then(countries => {
        this.countries = countries.slice();
        this.selected = 'CIA World Factbook';
        this.isScraping = false;
      });
  }

  public getAlertStatus(dataSource: string, hasSubResources?: boolean): AlertStatusStyle {
    const isBusy = this.isScrapingBusy(dataSource, hasSubResources);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource, hasSubResources);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource, hasSubResources);
    return {
      'alert-info': infoMode,
      'alert-warning': isBusy,
      'alert-danger': hasErrors
    };
  }

  public getAllUntouched(dataSource: SubResourceReference): boolean {
    return dataSource.subRefs.every(sub => sub.status === 0) || dataSource.subRefs.every(sub => sub.status === 2);
  }

  public getButtonStatus(dataSource: string, hasSubResources?: boolean): AlertStatus {
    const isBusy = this.isScrapingBusy(dataSource, hasSubResources);
    const hasErrors = !isBusy && this.hasFailedStatus(dataSource, hasSubResources);
    const infoMode = !isBusy && !this.hasFailedStatus(dataSource, hasSubResources);
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

  public getExportFragment(dataSource: string, iteration: number): { [key: string]: number } {
    const keyCount = this.getDashboardKeyCount(dataSource);
    const indexStart = Number(iteration) * LIST_SIZE;
    const indexEnd = (indexStart + LIST_SIZE) > keyCount ? keyCount : indexStart + LIST_SIZE;
    const relevantKeys = Object.keys(this.exportOptions[dataSource]).slice(indexStart, indexEnd);
    const exportFragment = {};
    relevantKeys.forEach(key => {
      exportFragment[key] = this.exportOptions[dataSource][key];
    });
    return exportFragment;
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

  public getMainSource(sourceName: string): CountryReference[] | SubResourceReference[] {
    switch (sourceName) {
      case 'Ports & Related': {
        return this.portsAndRelated;
      }
      default: {
        return this.countries;
      }
    }
  }

  public getSubSource(source: SubResourceReference[], dataSource: SubResourceReference): SubResourceReference[] {
    const ref = source.find(s => s.name === dataSource.name);
    return ref.subRefs;
  }

  public hasFailedStatus(dataSource: string, hasSubResources?: boolean): boolean {
    if (hasSubResources) {
      const sourceRef = this.portsAndRelated.find(source => source.name === dataSource);
      return sourceRef.status === -1 || sourceRef.subRefs.some(sub => sub.status === -1);
    } else {
      return this.getMainSource(dataSource).some(c => (c.status[dataSource] || c.status) === -1);
    }
  }

  public isComplete(dataSource: string, hasSubResources?: boolean): boolean {
    if (hasSubResources) {
      const sourceRef = this.portsAndRelated.find(source => source.name === dataSource);
      return sourceRef.status === 2 && sourceRef.subRefs.every(sub => sub.status === 2);
    } else {
      return this.getMainSource(dataSource).every(c => (c.status[dataSource] || c.status) === 2);
    }
  }

  public isScrapingBusy(dataSource: string, hasSubResources?: boolean): boolean {
    if (hasSubResources) {
      const sourceRef = this.portsAndRelated.find(source => source.name === dataSource);
      return this.isScraping || sourceRef.subRefs.some(a => a.status === 1);
    } else {
      return this.isScraping || this.getMainSource(dataSource).some(c => (c.status[dataSource] || c.status) === 1);
    }
  }

  public scrape(dataSource: string): void {
    this.isScraping = true;
    switch (dataSource) {
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
      case 'Ports & Related': {
        this.portsAndRelated.filter(c => c.status === 0 || c.status === -1).forEach(source => {
          this.scrapePortSource(source);
        });
        break;
      }
    }

    this.isScraping = false;
  }

  public scrapePortSourceByName(source: string): void {
    const subResource = this.portsAndRelated.find(s => s.name === source);
    this.scrapePortSource(subResource);
  }

  public scrapeCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeCountry(country);
  }

  public scrapeLeadersOfCountryByName(countryName: string): void {
    const country = this.countries.find(c => c.name === countryName);
    this.scrapeLeadersOfCountry(country);
  }

  public switchSelected(dataSource: string): void {
    this.selected = dataSource;
    if (dataSource === 'Ports & Related') {
      this.portsAndRelated.forEach(s => {
        this.reassignStatusWithSubResources(s);
      });
    }
  }

  public switchOntologyFormat(choice: string): void {
    this.activeOntFormat = choice;
  }
}
