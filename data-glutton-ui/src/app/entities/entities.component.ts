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
  activeEntityId: string = '';
  activeFoundEntityId: string = '';
  activeInnerId: string = '';
  activeOuterId: string = '';
  entityCategories: { [key: string]: { [key: string]: { count: number; values: Entity[] } } } = {
    'Airlines': {},
    'Airport/Helo': {},
    'Factbook': {},
    'World Leader': {}
  };
  entityTypes: string[] = [];
  foundEntities: Entity[] = [];
  searchText: string = '';
  selectedEntityType: string = '';
  selectedSearchType: string = '';
  viewChoice: boolean = true;

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
                this.entityTypes.push(minorKey);
                this.entityTypes.sort();
                this.entityCategories[majorKey][minorKey] = {
                  count: data.dashboard[majorKey][minorKey],
                  values: null
                };
              } else {
                this.entityCategories[majorKey][minorKey].count = data.dashboard[majorKey][minorKey];
              }
            });
          });
      }));
  }

  private fetchEntities(lookupKeys: string): void {
    const lookupKeysSplit = lookupKeys.split('-').map(v => v.trim());
    this.fetchService.fetchEntities(lookupKeysSplit[1])
      .pipe(
        take(1),
        catchError(err => {
          console.error('fetchEntities error: ', err.message);
          this.activeEntityId = '';
          return of([]);
        }))
      .subscribe(data => {
        this.entityCategories[lookupKeysSplit[0]][lookupKeysSplit[1]].values = data.entities;
      });
  }

  public entitySearch(): void {
    if (!this.selectedEntityType || !this.selectedSearchType || !this.searchText) {
      return;
    }
    this.fetchService.fetchEntity(this.selectedEntityType, this.selectedSearchType.toLowerCase(), this.searchText.split('/').join('%2F'))
      .pipe(
        take(1),
        catchError(err => {
          console.error('entitySearch error: ', err.message);
          this.activeEntityId = '';
          return of([]);
        }))
      .subscribe(data => {
        this.foundEntities = data.entities;
      });
  }

  public getKey(obj: any): string {
    return Object.keys(obj)[0];
  }

  public getLabel(obj: any): string {
    return obj['http://www.w3.org/2000/01/rdf-schema#label'];
  }

  public onViewChoiceChange(e: boolean): void {
    this.viewChoice = e;
  }

  public onSelectEntityType(entityType: string): void {
    this.selectedEntityType = entityType || '';
  }

  public onSelectSearchType(searchType: string): void {
    this.selectedSearchType = searchType || '';
  }

  public shorten(value: string): string {
    const poundIndex = value.indexOf('#');
    if (!value.indexOf('http') && poundIndex > -1) {
      return value.substr(poundIndex + 1);
    }
    return value;
  }

  public toggleAccordian(e: { panelId: string }, panelLevel: number): void {
    if (!panelLevel) {
      this.activeOuterId = this.activeOuterId === e.panelId ? '' : e.panelId;
    } else if (panelLevel === 1) {
      this.activeInnerId = this.activeInnerId === e.panelId ? '' : e.panelId;
      if (this.activeInnerId) {
        this.fetchEntities(this.activeInnerId);
      }
    } else {
      this.activeEntityId = this.activeEntityId === e.panelId ? '' : e.panelId;
    }
  }

}
