import { Component, OnInit } from '@angular/core';

export interface DataSource {
  description: string;
  label: string;
  link: string;
}

@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getSources(): DataSource[] {
    return [
      {
        description: 'The World Factbook provides information on the history, people and society, government, economy, energy, geography, communications, transportation, military, and transnational issues for 267 world entities. The Reference tab includes: a variety of world, regional, country, ocean, and time zone maps; Flags of the World; and a Country Comparison function that ranks the country information and data in more than 75 Factbook fields.',
        label: 'CIA World Factbook',
        link: 'https://www.cia.gov/library/publications/the-world-factbook/'
      },
      {
        description: '',
        label: 'CIA World Leaders',
        link: 'https://www.cia.gov/library/publications/resources/world-leaders-1/'
      }
    ];
  }

}
