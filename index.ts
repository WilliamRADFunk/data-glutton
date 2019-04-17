import * as fs from 'graceful-fs';
import * as path from 'path';

import { getCountries, getCountriesData, store } from 'factbook';

if (!fs.existsSync(`dist`)) {
    fs.mkdirSync('dist');
    fs.mkdirSync(path.join('dist', 'json'));
    fs.mkdirSync(path.join('dist', 'jsonld'));
    fs.mkdirSync(path.join('dist', 'ontology'));
    fs.mkdirSync(path.join('dist', 'ontology', 'jsonld'));
    fs.mkdirSync(path.join('dist', 'ontology', 'owl'));
    fs.mkdirSync(path.join('dist', 'images'));
}

Promise.all([getCountries()])
    .then(() => {
        getCountriesData();
    })
    .catch(err => {
        store.errorLogger(new Date().toISOString() + '\n\n' + err.toString() + '\n\n');
    });
