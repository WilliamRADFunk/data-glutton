import * as cheerio from 'cheerio';
import rp from 'request-promise-native';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { dataScrapers } from './data-getters';
import { CountryReference } from '../../models/country-reference';
import { countryToId } from '../../utils/country-to-id';
import { getCountryURL } from '../../utils/get-country-url';

const numberOfScrapers: number = Object.keys(dataScrapers).length;

export function getLeadersByCountryPromise(country: CountryReference): Promise<any> {
	const url = getCountryURL(country.dataCode, consts.BASE.URL_LEADER_BASE);
	return getLeadersByCountryData(country, url);
};

export function getLeadersByCountryData(country: CountryReference, url: string): Promise<void> {
	if (country && url) {
		console.log(country, url);
		return new Promise((resolve, reject) => {
			rp(url, { timeout: consts.BASE.DATA_REQUEST_TIMEOUT })
				.then((html: CheerioElement) => {
					const $ = cheerio.load(html);
					const countryId = countryToId(country.dataCode);
					dataScrapers.getLeaders($, country.name, countryId);
					store.progressLogger(country.name, 1 / numberOfScrapers);
					store.debugLogger(`Data scrape for ${country.name} is complete`);
					store.countriesInList.find(c => c.name === country.name).status.leaders = 2;
					const doug = store.countries.find({ '@id': { $eq: countryId } })[0];
					console.log('country', country.name, doug);
					resolve();
				})
				.catch((err: Error) => {
					store.failedCountries.push(country);
					const errMsg = `${
						new Date().toISOString()
					}\n\nIndividual country query failed:  ${
					country.name}\n${url}\n${err.toString().trim()}\n\n`;
					store.errorLogger(errMsg);
					store.countriesInList.find(c => c.name === country.name).status.leaders = -1;
					reject();
				});
			});
	} else {
		return new Promise((resolve) => {
			store.errorLogger(`${
				new Date().toISOString()}\n\nFailure to scrape data for ${
				country.name} at \n${url}\n\n`);
			resolve();
		}).then(() => { /* not empty */ });
	}
}
