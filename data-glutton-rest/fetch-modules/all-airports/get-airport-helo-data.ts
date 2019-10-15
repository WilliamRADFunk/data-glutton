import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string, subSource?: string): Promise<void> {
      const subResourceSource = store.subResourceList.find(s => s.name === source);
      const subResourceSubSource = subResourceSource.subRefs.find(s => s.name === subSource);
	if (source === 'Airports ~ Heliports ~ Airlines ~ Routes') {
            subResourceSource.status = 1;
            switch(subSource) {
                  case 'GeoJson Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromGeoJson();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Npm Airports': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getAirportsFromNpm();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Airport Runways': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getRunwaysFromOurAirports();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Helicopter Landing Zones': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getHelicopterLandingZones();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Airlines': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getAirlineOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Planes': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getPlanesOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Routes': {
                        return new Promise(async (resolve, reject) => {
                              await dataScrapers.getRoutesOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              subResourceSource.status = 2;
                              resolve();
		            });
                  }
                  default: {
                        return new Promise((resolve, reject) => {
                              const partNum = Number(subSource.split('~')[1].trim());
                              dataScrapers.getAirportsFromDatahub(partNum);
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
            }
	}
}
