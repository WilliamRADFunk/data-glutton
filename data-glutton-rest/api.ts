import express from 'express';
import cors from 'cors';
// import { path } from 'path';
import { getCountries } from './utils/get-countries';
import { store } from './constants/globalStore';

const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.get('/countries', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }
    // store.countries.find({ '@id': { $eq: 'http://williamrobertfunk.com/instance/Country/d1e62250-7595-3a6e-a06d-b24b1debf110'} });
    return res.send(store.countriesInList);
});

app.listen(port, () => {
    console.log(`Data Glutton Backend listening on port ${port}!`);
});
