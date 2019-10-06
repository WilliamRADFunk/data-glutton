import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { FetchCoordinator } from '../services/fetch-coordinator/fetch-coordinator.service';

@Component({
  selector: 'app-ontology',
  templateUrl: './ontology.component.html',
  styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnInit {
  public activeOntologyId: string = "";
  public ontologies: { [key: string]: any } = {};

  constructor(private readonly fetchService: FetchCoordinator) { }

  ngOnInit(): void {
    this.fetchService.fetchOntologies()
      .pipe(
        take(1),
        catchError(err => {
          console.error('fetchOntologies error: ', err.message);
          return of(this.ontologies);
        }))
      .subscribe(data => {
        Object.keys(data.ontologies).forEach(ont => {
          this.fetchService.fetchOntology(ont)
            .pipe(take(1))
            .subscribe(res => {
              this.ontologies[ont] = res['ontology'];
            });
        });
    });
  }

  public toggleAccordian(oPanel: { panelId: string }): void {
    this.activeOntologyId = this.activeOntologyId === oPanel.panelId ? '' : oPanel.panelId;
  }
}
