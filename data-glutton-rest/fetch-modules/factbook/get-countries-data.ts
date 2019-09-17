import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { getCountryURL } from '../../utils/get-country-url';
import { getCountryData } from './get-country-data';
// import { getImages } from './get-images';
// import { saveFiles } from './save-files';

const createCountriesPromises = () => {
	const countryDataPromises: Array<Promise<any>> = [];
	const countries = store.countriesInList.slice();
	countries.forEach((country) => {
		const url = getCountryURL(country.dataCode, consts.BASE.URL_COUNTRY_BASE_FACTBOOK);
		countryDataPromises.push(getCountryData(country, url));
	});
	return countryDataPromises;
};

export async function getCountriesData(): Promise<void> {
	store.countriesInList.sort();
	const promises = createCountriesPromises();
	await Promise.all(promises)
		.then(async () => {
			if (store.failedCountries.length) {
				store.countriesInList = store.failedCountries.slice();
				store.failedCountries.length = 0;
				await getCountriesData();
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

