import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SourcesComponent } from './sources/sources.component';
import { ErrorComponent } from './error/error.component';
import { OntologyComponent } from './ontology/ontology.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SourcesComponent,
    ErrorComponent,
    OntologyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule.forRoot()
  ],
  providers: [ HttpClient ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
