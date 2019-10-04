import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';
import { Entity } from '../models/entity';

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  activeEntityId: string = "";
  activeInnerId: string = "";
  activeOuterId: string = "";
  entityCategories: { [key: string]: { [key: string]: { count: number; values: Entity[] } } } = {
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
          Object.keys(data.dashboard).forEach(majorKey => {
            Object.keys(data.dashboard[majorKey]).forEach(minorKey => {
              if (!this.entityCategories[majorKey][minorKey]) {
                this.entityCategories[majorKey][minorKey] = {
                  count: data.dashboard[majorKey][minorKey],
                  values: null
                };
              } else {
                this.entityCategories[majorKey][minorKey].count = data.dashboard[majorKey][minorKey];
              }
            })
          });
      }));
  }

  private fetchEntities(lookupKeys: string): void {
    const lookupKeysSplit = lookupKeys.split('-').map(v => v.trim());
    this.fetchService.fetchEntities(lookupKeysSplit[1])
      .pipe(take(1))
      .subscribe(data => {
        this.entityCategories[lookupKeysSplit[0]][lookupKeysSplit[1]].values = data.entities;
      });
  }

  public getKey(obj: any): string {
    return Object.keys(obj)[0];
  }

  public getLabel(obj: any): string {
    return obj['http://www.w3.org/2000/01/rdf-schema#label'];
  }

  public shorten(value: string): string {
    const poundIndex = value.indexOf('#');
    if (!value.indexOf('http') && poundIndex > -1) {
      return value.substr(poundIndex + 1);
    }
    return value;
  }

  public toggleAccordian(e, panelLevel: number): void {
    if (!panelLevel) {
      this.activeOuterId = this.activeOuterId == e.panelId ? "" : e.panelId;
    } else if (panelLevel === 1){
      this.activeInnerId = this.activeInnerId == e.panelId ? "" : e.panelId;
      if (this.activeInnerId) {
        this.fetchEntities(this.activeInnerId);
      }
    } else {
      this.activeEntityId = this.activeEntityId == e.panelId ? "" : e.panelId;
    }
  }

}
