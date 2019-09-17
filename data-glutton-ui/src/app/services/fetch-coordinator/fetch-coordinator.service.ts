import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { FactbookFetchService } from '../factbook-fetch/factbook-fetch.service';

@Injectable({
  providedIn: 'root'
})
export class FetchCoordinator {

  constructor(
    private readonly factbookFetch: FactbookFetchService,
    private readonly http: HttpClient) { }

  fetchCountries(): Observable<any> {
    return this.http.get('http://localhost:3000/country-list');
  }

  fetchDashboard(): Observable<any> {
    return timer(0, 2000).pipe(switchMap(() => this.http.get<any>('http://localhost:3000/dashboard')));
  }

  fetchCountry(countryName: string): Observable<any> {
    return this.http.get(`http://localhost:3000/country/${countryName}`);
  }

  fetchLeaders(countryName: string): Observable<any> {
    return this.http.get(`http://localhost:3000/leaders/${countryName}`);
  }

  scrapeFactbook(): Observable<any> {
    return this.http.get('http://localhost:3000/scrape-factbook');
  }

  async runFactbookFetcher(): Promise<any> {
    return this.scrapeFactbook().toPromise();
  }
}
