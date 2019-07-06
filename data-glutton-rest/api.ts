import express from 'express';
// import { path } from 'path';
import { getCountries } from './utils/get-countries';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.get('/countries', (req, res) => {
    getCountries();
    return res.send('Hello Other World!');
});

app.listen(port, () => {
    // console.log(`Data Glutton Backend listening on port ${port}!`);
});
