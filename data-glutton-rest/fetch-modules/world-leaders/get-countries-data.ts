import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { getCountryURL } from '../../utils/get-country-url';
import { getLeadersByCountryData } from './get-country-data';
// import { getImages } from './get-images';
// import { saveFiles } from './save-files';

const createLeadersByCountriesPromises = () => {
	const countryDataPromises: Array<Promise<any>> = [];
	const countries = store.countriesInList.slice();
	countries.forEach((country) => {
		const url = getCountryURL(country.dataCode.toUpperCase(), consts.BASE.URL_LEADER_BASE);
		countryDataPromises.push(getLeadersByCountryData(country, url));
	});
	return countryDataPromises;
};

export async function getLeadersByCountriesData(): Promise<void> {
	store.countriesInList.sort();
	const promises = createLeadersByCountriesPromises();
	await Promise.all(promises)
		.then(async () => {
			if (store.failedCountries.length) {
				store.countriesInList = store.failedCountries.slice();
				store.failedCountries.length = 0;
				await getLeadersByCountriesData();
			} else {
				// saveFiles();
				// await getImages();
				// flushStore();
			}
		})
		.catch((err) => {
			store.errorLogger(new Date().toISOString() + '\n\ngetCountriesData\n\n' + err.toString() + '\n\n');
		});
}

