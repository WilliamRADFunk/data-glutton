import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string, subSource?: string): Promise<void> {
      const airportHeloSource = store.airportHeloList.find(s => s.name === source);
      const airportHeloSubSource = airportHeloSource.subRefs.find(s => s.name === subSource);
	if (source === 'Airports') {
            switch(subSource) {
                  case 'GeoJson Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromGeoJson();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                        break;
                  }
                  case 'Npm Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromNpm();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                        break;
                  }
                  case 'DataHub Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromDatahub();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                        break;
                  }
                  case 'Airport Runways': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getRunwaysFromOurAirports();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                        break;
                  }
                  case 'Helicopter Landing Zones': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getHelicopterLandingZones();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              airportHeloSource.status = 2;
                              resolve();
		            });
                        break;
                  }
            }
	}
}
