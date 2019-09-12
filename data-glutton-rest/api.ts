import express from 'express';
import cors from 'cors';
// import { path } from 'path';
import { getCountries } from './utils/get-countries';
import { store } from './constants/globalStore';
import { getCountriesData } from './fetch-modules/factbook/get-countries-data';

const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.get('/country-list', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }
    // store.countries.find({ '@id': { $eq: 'http://williamrobertfunk.com/instance/Country/d1e62250-7595-3a6e-a06d-b24b1debf110'} });
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
