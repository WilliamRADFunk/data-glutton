import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ControlCenterComponent } from './control-center/control-center.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SourcesComponent } from './sources/sources.component';
import { OntologyComponent } from './ontology/ontology.component';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'controls'
  },
  {
    path: 'controls',
    pathMatch: 'full',
    component: ControlCenterComponent
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: DashboardComponent
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
