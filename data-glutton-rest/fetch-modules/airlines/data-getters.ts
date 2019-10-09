import { getAirlineOpenFlights } from './airlines-openflights';
import { store } from '../../constants/globalStore';
import { SubResourceReference } from '../../models/sub-resource-reference';

export const dataScrapers = {
	getAirlineOpenFlights,
};

export function getAirlineResourcePromise(sourceRef: SubResourceReference): Promise<any> {
	if (sourceRef) {
		sourceRef.status = 1;
		switch(sourceRef.name) {
			case 'Airlines (Openflights)': {
				return new Promise((resolve, reject) => {
					resolve(getAirlineOpenFlights());
					store.debugLogger(`Data scrape for ${sourceRef.name} is complete`);
					sourceRef.status = 2;
				});
			}
		}
	} else {
		store.airlineResourceList[0].status = 1;
		return new Promise((resolve, reject) => {
			resolve(getAirlineOpenFlights());
			store.debugLogger(`Data scrape for ${store.airlineResourceList[0].name} is complete`);
			store.airlineResourceList[0].status = 2;
		});
	}
}