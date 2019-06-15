import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-control-center',
  templateUrl: './control-center.component.html',
  styleUrls: ['./control-center.component.scss']
})
export class ControlCenterComponent implements OnInit {
  /**
   * Flag to track if scaping is underway.
   */
  isScraping: { [key: string]: boolean } = {
    airports: false,
    factbook: false,
    leaders: false,
  };
  /**
   * Flag to track if store initialization is underway.
   */
  isSeedingStore: { [key: string]: boolean } = {
    airports: false,
    countries: false,
    leaders: false,
  };

  constructor() { }

  ngOnInit() {
  }

  flushStore() {
    // Dump the store and reset controls
  }

  initScraping(type?: string) {
    if (this.isScraping) {
      return;
    }
    if (!type) {
      // Scrape all sources
    } else {
      // Scrape selected source
    }
  }

  initStore(type?: string) {
    if (this.isSeedingStore) {
      return;
    }
    if (!type) {
      // Seed store with all files
    } else {
      // Seed store with selected type
    }
  }

  scrapeAll() {
    // Scrape all the data
  }

}
