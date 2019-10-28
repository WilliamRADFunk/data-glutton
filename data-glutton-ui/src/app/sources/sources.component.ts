import { Component, OnInit } from '@angular/core';

export interface DataSource {
  description: string;
  label: string;
  license: string;
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
        description: `"The World Factbook provides information on the history,
          people and society, government, economy, energy, geography,
          communications, transportation, military, and transnational issues for
          267 world entities. The Reference tab includes: a variety of world,
          regional, country, ocean, and time zone maps; Flags of the World; and
          a Country Comparison function that ranks the country information and
          data in more than 75 Factbook fields."`,
        label: 'CIA World Factbook',
        license: 'Public Domain',
        link: 'https://www.cia.gov/library/publications/the-world-factbook/'
      },
      {
        description: `"The Central Intelligence Agency publishes and updates the
          online directory of Chiefs of State and Cabinet Members of Foreign
          Governments weekly. The directory is intended to be used primarily as
          a reference aid and includes as many governments of the world as is
          considered practical, some of them not officially recognized by the
          United States. Regimes with which the United States has no diplomatic
          exchanges are indicated by the initials NDE."`,
        label: 'CIA World Leaders',
        license: 'Public Domain',
        link: 'https://www.cia.gov/library/publications/resources/world-leaders-1/'
      },
      {
        description: `"A MySQL table of information gathered from an unknown
          origin to be used by Blue Bay Travel as part of an internal
          autocompletion algorithm."`,
        label: 'JSON-Airports',
        license: 'MIT',
        link: 'https://raw.githubusercontent.com/jbrooksuk/JSON-Airports/master/airports.json'
      },
      {
        description: `"A simple, open source website, CDN, and CLI utility for
          the fast access of GeoJSON data for web mapping examples and experiments."`,
        label: 'GeoJson-Airports',
        license: 'Public Domain',
        link: 'http://geojson.xyz/'
      },
      {
        description: `"A simple, open source website, CDN, and CLI utility for
          the fast access of GeoJSON data for web mapping examples and experiments."`,
        label: 'GeoJson-Seaports',
        license: 'Public Domain',
        link: 'http://geojson.xyz/'
      },
      {
        description: `"DataHub began as a project by Datopian and Open
          Knowledge International. For over a decade they’ve been creating tools
          and applications for data. Original source: OurAirports.com"`,
        label: 'Datahub-Airports',
        license: 'Public Domain',
        link: 'https://datahub.io/core/airport-codes#resource-airport-codes'
      },
      {
        description: `"OurAirports is a free site where visitors can explore
          the world's airports, read other people's comments, and leave their own."`,
        label: 'OurAirports',
        license: 'Public Domain',
        link: 'http://ourairports.com/data/'
      },
      {
        description: `"OpenFlights Airlines Database contains over 10,000 airlines,
          train stations and ferry terminals spanning the globe."`,
        label: 'OpenFlights-Airlines',
        license: 'Open Database License + Database Contents License',
        link: 'https://openflights.org/data.html'
      },
      {
        description: `"OpenFlights Routes Database contains over 10,000 Routes,
          train stations and ferry terminals spanning the globe."`,
        label: 'OpenFlights-Routes',
        license: 'Open Database License + Database Contents License',
        link: 'https://openflights.org/data.html'
      },
      {
        description: `"Document oriented database written in javascript.
          Its purpose is to store javascript objects as documents in a
          nosql fashion and retrieve them with a similar mechanism."`,
        label: 'LokiJS 1.5',
        license: 'MIT. See https://www.npmjs.com/package/lokijs#license',
        link: 'https://www.npmjs.com/package/lokijs'
      },
      {
        description: `"Angular is a platform for building mobile and desktop web applications."`,
        label: 'Angular 8',
        license: 'MIT',
        link: 'https://angular.io/'
      },
      {
        description: `"Fast, unopinionated, minimalist web framework for Node.js"`,
        label: 'ExpressJS 4',
        license: 'Creative Commons Attribution-ShareAlike 3.0 United States License',
        link: 'https://expressjs.com/'
      }
    ];
  }

}
