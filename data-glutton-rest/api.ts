import express from 'express';
import cors from 'cors';
// import { path } from 'path';
import { getCountries } from './utils/get-countries';
import { store } from './constants/globalStore';
import { getCountriesData } from './fetch-modules/factbook/get-countries-data';
import { getCountryPromise } from './fetch-modules/factbook/get-country-data';
import { CountryReference } from './models/country-reference';

const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.get('/country/:countryName', async (req, res) => {
    const countryName = req && req.params && req.params.countryName;
    if (!countryName) {
        return res.status(404).send({ message: 'Invalid country name' });
    }
    if (!store.countriesInList.length) {
        await getCountries();
    }
    const countryRef: CountryReference = store.countriesInList.find((c: CountryReference) => {
        return c.name === countryName;
    });
    if (countryRef) {
        getCountryPromise(countryRef)
            .then(done => {
                return res.status(200).send({ success: true });
            })
            .catch(err => {
                return res.status(500).send({ message: 'Unable to scrape country' });
            });
    } else {
        return res.status(404).send({ message: 'Invalid country name' });
    }
});

app.get('/country-list', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }

    return res.send(store.countriesInList);
});

app.get('/scrape-factbook', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }
    getCountriesData().then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        console.error('scrape-factbook error: ', err);
        return res.status(500).send({ success: false });
    });
});

app.listen(port, () => {
    console.log(`Data Glutton Backend listening on port ${port}!`);
});
