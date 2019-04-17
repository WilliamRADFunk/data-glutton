import * as fs from 'graceful-fs';
import * as path from 'path';

import { getCountries, store, getCountryURL, getCountryData, flushStore, getImages, saveFiles } from 'factbook';

if (!fs.existsSync(`dist`)) {
    fs.mkdirSync('dist');
    fs.mkdirSync(path.join('dist', 'json'));
    fs.mkdirSync(path.join('dist', 'jsonld'));
    fs.mkdirSync(path.join('dist', 'ontology'));
    fs.mkdirSync(path.join('dist', 'ontology', 'jsonld'));
    fs.mkdirSync(path.join('dist', 'ontology', 'owl'));
    fs.mkdirSync(path.join('dist', 'images'));
}

const getCountriesData = () => {
    const countryDataPromises: Array<Promise<any>> = [];
    const countries = store.countriesInList.slice();
    countries.forEach(country => {
        const url = getCountryURL(country.isoCode);
        countryDataPromises.push(getCountryData(country, url));
    });
    return countryDataPromises;
};

const promisesResolutionForCountries = () => {
    store.countriesInList.sort();
    const promises = getCountriesData();
    Promise.all(promises)
        .then(() => {
            if (store.failedCountries.length) {
                store.countriesInList = store.failedCountries.slice();
                store.failedCountries.length = 0;
                setTimeout(() => {
                    store.debugLogger('Waiting 3 seconds before retrieving missed countries...');
                    promisesResolutionForCountries()
                }, 3000);
            } else {
                saveFiles();
                getImages();
                flushStore();
            }
        })
        .catch(err => {
            store.errorLogger(new Date().toISOString() + '\n\n' + err.toString() + '\n\n');
        });
}

Promise.all([getCountries()])
    .then(() => {
        promisesResolutionForCountries();
    })
    .catch(err => {
        store.errorLogger(new Date().toISOString() + '\n\n' + err.toString() + '\n\n');
    });
