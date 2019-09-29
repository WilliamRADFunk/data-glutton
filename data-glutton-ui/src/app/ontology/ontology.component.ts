import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

@Component({
  selector: 'app-ontology',
  templateUrl: './ontology.component.html',
  styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnDestroy, OnInit {
  private _subs: Subscription[] = [];
  ontologies: { [key: string]: any } = {};

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnDestroy(): void {
    this._subs.forEach(s => s && s.unsubscribe());
    this._subs.length = 0;
  }

  ngOnInit() {
    this._subs.push(
      this.fetchService.fetchOntologies()
        .pipe(catchError(err => {
          console.error('fetchOntologies error: ', err.message);
          return of(this.ontologies);
        }))
        .subscribe(data => {
          Object.keys(data.ontologies).forEach(ont => {
            console.log(ont, data.ontologies[ont]);
            try {
              this.ontologies[ont] = JSON.parse(data.ontologies[ont]);
            } catch (err) {
              this.ontologies[ont] = err;
            }
          });
      }));
  }

  public getLabel(ont: any): string {
    console.log(Object.keys(ont));
    return ont['http://www.w3.org/2000/01/rdf-schema#label'];
  }

}
