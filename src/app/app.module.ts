import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlCenterComponent } from './control-center/control-center.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SourcesComponent } from './sources/sources.component';
import { ErrorComponent } from './error/error.component';
import { OntologyComponent } from './ontology/ontology.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlCenterComponent,
    DashboardComponent,
    SourcesComponent,
    ErrorComponent,
    OntologyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
