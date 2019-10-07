import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Entity } from '../../models/entity';

@Injectable({
  providedIn: 'root'
})
export class FetchCoordinator {
  ontologies: { [key: string]: any } = {};

  constructor(private readonly http: HttpClient) { }

  fetchSubResources(): Observable<any> {
    return this.http.get('http://localhost:3000/sub-resource-list');
  }

  fetchCountries(): Observable<any> {
    return this.http.get('http://localhost:3000/country-list');
  }

  fetchDashboard(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/dashboard');
  }

  fetchEntity(key: string, field: string, text: string): Observable<any> {
    return this.http.get<{ entities: Entity[] }>(`http://localhost:3000/entity/${key}/${field}/${text}`);
  }

  fetchEntities(minorKey: string): Observable<any> {
    return this.http.get<{ entities: Entity[] }>(`http://localhost:3000/entities/${minorKey}`);
  }

  fetchDashboardStream(): Observable<any> {
    return timer(0, 2000).pipe(switchMap(() => this.http.get<any>('http://localhost:3000/dashboard')));
  }

  fetchOntologies(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/ontologies/');
  }

  fetchOntology(ontology: string): Observable<any> {
    if (!this.ontologies[ontology]) {
      const prom = this.http.get<any>(`http://localhost:3000/ontology/${ontology}`);
      prom.toPromise().then(res => {
        this.ontologies[ontology] = res;
      });
      return prom;
    } else {
      return of(this.ontologies[ontology]);
    }
  }

  fetchSubResource(source: string, subSource?: string): Observable<any> {
    return this.http.get(`http://localhost:3000/sub-resource/${source}/${subSource || ''}`);
  }

  fetchCountry(countryName: string): Observable<any> {
    return this.http.get(`http://localhost:3000/country/${countryName}`);
  }

  fetchLeaders(countryName: string): Observable<any> {
    return this.http.get(`http://localhost:3000/leaders/${countryName}`);
  }

  flushEntities(): Observable<any> {
    return this.http.get(`http://localhost:3000/entities/flush`);
  }

  saveFiles(files: string): Observable<any> {
    return this.http.get(`http://localhost:3000/save-files/${files}`);
  }

  scrapeFactbook(): Observable<any> {
    return this.http.get('http://localhost:3000/scrape-factbook');
  }

  async runFactbookFetcher(): Promise<any> {
    return this.scrapeFactbook().toPromise();
  }
}
