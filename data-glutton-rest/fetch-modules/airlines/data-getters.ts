import { getAirlineOpenFlights } from './airlines-openflights';
import { getRoutesOpenFlights } from './routes-openflights';
import { store } from '../../constants/globalStore';

export const dataScrapers = {
	getAirlineOpenFlights,
	getRoutesOpenFlights
};

export function getAirlineResourcePromise(source: string, subSource?: string): Promise<void> {
	const subResourceSource = store.airlineResourceList.find(s => s.name === source);
    const subResourceSubSource = subResourceSource.subRefs.find(s => s.name === subSource);
	if (source === 'Airlines (Openflights)') {
            subResourceSource.status = 1;
            switch(subSource) {
                  case 'Airlines': {
                        return new Promise((resolve, reject) => {
                              getAirlineOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  case 'Routes': {
                        return new Promise((resolve, reject) => {
                              dataScrapers.getRoutesOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
                              subResourceSubSource.status = 2;
                              resolve();
		            });
                  }
                  default: {
                        return new Promise((resolve, reject) => {
                            getAirlineOpenFlights();
                            store.debugLogger(`Data scrape for Airports is complete`);
							getRoutesOpenFlights();
                            store.debugLogger(`Data scrape for Routes is complete`);
                            store.airlineResourceList[0].subRefs.forEach(sub => sub.status = 2);
                            resolve();
		            });
                  }
            }
	}
}