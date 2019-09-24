import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string, subSource?: string): Promise<void> {
      console.log('getAirportsHelosData', 'airportHeloSource', store.airportHeloList && store.airportHeloList.length);
      const airportHeloSource = store.airportHeloList.find(s => s.name === source);
      console.log('getAirportsHelosData', 'airportHeloSubSource', airportHeloSource.subRefs && airportHeloSource.subRefs.length);
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
                  }
                  case 'Npm Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromNpm();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Airport Runways': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getRunwaysFromOurAirports();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Helicopter Landing Zones': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getHelicopterLandingZones();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              airportHeloSource.status = 2;
                              resolve();
		            });
                  }
                  default: {
                        return new Promise((resolve, reject) => {
                              const partNum = Number(subSource.split('~')[1].trim());
                              dataScrapers.getAirportsFromDatahub(partNum);
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              airportHeloSubSource.status = 2;
                              resolve();
		            });
                  }
            }
	}
}
