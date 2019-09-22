import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';

export function getAirportsHelosData(source: string): Promise<void> {
    const airportHeloSource = store.airportHeloList.find(s => s.name === source);
	if (source === 'Airports') {
		return new Promise(async (resolve, reject) => {
            const numberOfScrapers = 4;
            dataScrapers.getAirportsFromGeoJson();
		store.progressLogger('Airports', 1 / numberOfScrapers);
            dataScrapers.getAirportsFromNpm();
		store.progressLogger('Airports', 2 / numberOfScrapers);
            dataScrapers.getAirportsFromDatahub();
		store.progressLogger('Airports', 3 / numberOfScrapers);
            await dataScrapers.getRunwaysFromOurAirports();
		store.progressLogger('Airports', 4 / numberOfScrapers);
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.find(s => s.name === airportHeloSource.name).status = 2;
            resolve();
		});
	} else if (source === 'Helicopter Landing Zone') {
		return new Promise(async (resolve, reject) => {
            const numberOfScrapers = 1;
            dataScrapers.getHelicopterLandingZones();
		store.progressLogger('Helicopter Landing Zones', 1 / numberOfScrapers);
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.find(s => s.name === airportHeloSource.name).status = 2;
            resolve();
		});
	} else {
        return new Promise(async (resolve, reject) => {
            const numberOfScrapers = 5;
            dataScrapers.getAirportsFromGeoJson();
		store.progressLogger('Airports', 1 / numberOfScrapers);
            dataScrapers.getAirportsFromNpm();
		store.progressLogger('Airports', 2 / numberOfScrapers);
            dataScrapers.getAirportsFromDatahub();
		store.progressLogger('Airports', 3 / numberOfScrapers);
            await dataScrapers.getRunwaysFromOurAirports();
		store.progressLogger('Airports', 4 / numberOfScrapers - 1);
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            dataScrapers.getHelicopterLandingZones();
		store.progressLogger('Helicopter Landing Zones', 5 / numberOfScrapers);
            store.debugLogger(`Data scrape for ${airportHeloSource.name} is complete`);
            store.airportHeloList.forEach(s => s.status = 2);
            resolve();
		});
    }
}
