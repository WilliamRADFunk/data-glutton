import cors from 'cors';
import express from 'express';
// import { path } from 'path';
import { store } from './constants/globalStore';
import { getAirportsHelosData } from './fetch-modules/all-airports/get-airport-helo-data';
import { getCountriesData } from './fetch-modules/factbook/get-countries-data';
import { getCountryPromise } from './fetch-modules/factbook/get-country-data';
import { getLeadersByCountriesData } from './fetch-modules/world-leaders/get-countries-data';
import { getLeadersByCountryPromise } from './fetch-modules/world-leaders/get-country-data';
import { CountryReference } from './models/country-reference';
import { flushStore } from './utils/flush-store';
import { getCountries } from './utils/get-countries';

const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello World!');
});

app.get('/airports-helos/:source/:subSource', async (req, res) => {
    const source = req && req.params && req.params.source;
    const subSource = req && req.params && req.params.subSource;
    const sourceObj = store.airportHeloList.filter(a => a.name === source);
    const subSourceObj = sourceObj.length ? sourceObj[0].subRefs.filter(sub => sub.name === subSource) : [];
    subSourceObj.length ? subSourceObj[0].status = 1 : '';
    getAirportsHelosData(source, subSource).then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        console.error(`Unable to scrape ${source}: ${err}`);
        const sourceObj = store.airportHeloList.filter(a => a.name === source);
        const subSourceObj = sourceObj.length ? sourceObj[0].subRefs.filter(sub => sub.name === subSource) : [];
        subSourceObj.length ? subSourceObj[0].status = -1 : '';
        return res.status(500).send({ success: false });
    });
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

app.get('/entities/flush/', (req, res) => {
    flushStore();
    return res.status(200).send();
});

app.get('/leaders/:countryName', async (req, res) => {
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
        getLeadersByCountryPromise(countryRef)
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

app.get('/airport-helo-list', async (req, res) => {
    return res.send(store.airportHeloList);
});

app.get('/country-list', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }

    return res.send(store.countriesInList);
});

app.get('/scrape-airports-helos', async (req, res) => {
    getAirportsHelosData(null).then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        console.error('scrape-airports-helos error: ', err);
        return res.status(500).send({ success: false });
    });
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

app.get('/scrape-leaders', async (req, res) => {
    if (!store.countriesInList.length) {
        await getCountries();
    }
    getLeadersByCountriesData().then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        console.error('scrape-leaders error: ', err);
        return res.status(500).send({ success: false });
    });
});

app.get('/dashboard', async (req, res) => {
    const dashboard: { [key: string]: { [key: string]: number } } = {
        'Airports/Helo': {
            'Airlines': store.airlines.count(),
            'Airports': store.airports.count(),
            'Helicopter Landing Zones': store.helicopterLandingZones.count(),
            'Municipalities': store.municipalities.count(),
            'Runways': store.runways.count(),
            'Surface Materials': store.surfaceMaterials.count(),
        },
        'Factbook': {
            'Agricultural Lands': store.agriculturalLands.count(),
            'Arable Lands': store.arableLands.count(),
            'Artificially Irrigated Lands': store.artificiallyIrrigatedLands.count(),
            'Border Countries': store.borderCountries.count(),
            'Border Maps': store.borderMaps.count(),
            'Borders': store.borders.count(),
            'Climate Zones': store.climateZones.count(),
            'Climates': store.climates.count(),
            'Coasts': store.coasts.count(),
            'Countries': store.countries.count(),
            'Domain Areas': store.domainAreas.count(),
            'Elevations': store.elevations.count(),
            'Forest Lands': store.forestLands.count(),
            'Geographic Notes': store.geographicNotes.count(),
            'Images': store.images.count(),
            'Land Uses': store.landUses.count(),
            'Locations': store.locations.count(),
            'Maritime Claims': store.maritimeClaims.count(),
            'National Flags': store.nationalFlags.count(),
            'Natural Hazards': store.naturalHazards.count(),
            'Natural Resources': store.naturalResources.count(),
            'Other Lands': store.otherLands.count(),
            'Permanent Crops Lands': store.permanentCropsLands.count(),
            'Permanent Pasture Lands': store.permanentPastureLands.count(),
            'Region Maps': store.regionMaps.count(),
            'Terrains': store.terrains.count()
        },
        'World Leader': {
            'Government Offices': store.govOffices.count(),
            'Persons': store.persons.count()
        }
    };

    return res.send({ dashboard });
});

app.listen(port, () => {
    console.log(`Data Glutton Backend listening on port ${port}!`);
});
