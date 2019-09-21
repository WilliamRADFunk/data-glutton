import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string): Promise<void> {
    const airportHeloSource = store.airportHeloList.find(s => s.name === source);
	if (source === 'Airports') {
		return new Promise(async (resolve, reject) => {
            dataScrapers.getAirportsFromGeoJson();
            dataScrapers.getAirportsFromNpm();
            dataScrapers.getAirportsFromDatahub();
            await dataScrapers.getRunwaysFromOurAirports();
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.find(s => s.name === airportHeloSource.name).status = 2;
            resolve();
		});
	} else if (source === 'Helicopter Landing Zone') {
		return new Promise(async (resolve, reject) => {
            dataScrapers.getHelicopterLandingZones();
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.find(s => s.name === airportHeloSource.name).status = 2;
            resolve();
		});
	} else {
        return new Promise(async (resolve, reject) => {
            dataScrapers.getAirportsFromGeoJson();
            dataScrapers.getAirportsFromNpm();
            dataScrapers.getAirportsFromDatahub();
            await dataScrapers.getRunwaysFromOurAirports();
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            dataScrapers.getHelicopterLandingZones();
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.forEach(s => s.status = 2);
            resolve();
		});
    }
}
