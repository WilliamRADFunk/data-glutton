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
                        return new Promise(async (resolve, reject) => {
							await getAirlineOpenFlights();
							store.debugLogger(`Data scrape for ${subSource} is complete`);
							subResourceSubSource.status = 2;
							resolve();
		            });
                  }
                  case 'Routes': {
                        return new Promise(async (resolve, reject) => {
                              await getRoutesOpenFlights();
                              store.debugLogger(`Data scrape for ${subSource} is complete`);
							  subResourceSubSource.status = 2;
							  subResourceSource.status = 2;
                              resolve();
		            });
                  }
                  default: {
                        return new Promise(async (resolve, reject) => {
                            await getAirlineOpenFlights();
                            store.debugLogger(`*Data scrape for Airports is complete`);
							await getRoutesOpenFlights();
                            store.debugLogger(`*Data scrape for Routes is complete`);
							store.airlineResourceList[0].subRefs.forEach(sub => sub.status = 2);
							subResourceSource.status = 2;
                            resolve();
		            });
                  }
            }
	}
}