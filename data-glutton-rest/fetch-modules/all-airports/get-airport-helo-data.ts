import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string, subSource?: string): Promise<void> {
      console.log('getAirportsHelosData', 'subResourceSource', store.subResourceList && store.subResourceList.length);
      const subResourceSource = store.subResourceList.find(s => s.name === source);
      console.log('getAirportsHelosData', 'subResourceSubSource', subResourceSource.subRefs && subResourceSource.subRefs.length);
      const subResourceSubSource = subResourceSource.subRefs.find(s => s.name === subSource);
	if (source === 'Airports') {
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
