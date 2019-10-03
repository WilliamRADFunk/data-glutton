import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  entityCategories: { [key: string]: { [key: string]: number } } = {
    'Airport/Helo': {},
    'Factbook': {},
    'World Leader': {}
  };

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnDestroy(): void {
    this._subs.forEach(s => s && s.unsubscribe());
    this._subs.length = 0;
  }

  ngOnInit() {
    this._subs.push(
      this.fetchService.fetchDashboardStream()
        .pipe(catchError(err => {
          console.error('fetchDashboardStream error: ', err.message);
          return of(this.entityCategories);
        }))
        .subscribe(data => {
          this.entityCategories = data.dashboard;
      }));
  }

  public getLabel(ont: any): string {
    console.log(Object.keys(ont));
    return ont['http://www.w3.org/2000/01/rdf-schema#label'];
  }

  public toggleAccordian(e): void {
    console.log('toggle', e);
  }

}
