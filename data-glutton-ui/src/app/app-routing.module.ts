import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SourcesComponent } from './sources/sources.component';
import { OntologyComponent } from './ontology/ontology.component';
import { ErrorComponent } from './error/error.component';
import { EntitiesComponent } from './entities/entities.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: DashboardComponent
  },
  {
    path: 'entities',
    pathMatch: 'full',
    component: EntitiesComponent
  },
  {
    path: 'ontology',
    pathMatch: 'full',
    component: OntologyComponent
  },
  {
    path: 'sources',
    pathMatch: 'full',
    component: SourcesComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
