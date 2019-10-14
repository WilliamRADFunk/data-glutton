import cors from 'cors';
import express from 'express';

import { consts } from './constants/constants';
import { store } from './constants/globalStore';
import { getAirportsHelosData } from './fetch-modules/all-airports/get-airport-helo-data';
import { getCountriesData } from './fetch-modules/factbook/get-countries-data';
import { getCountryPromise } from './fetch-modules/factbook/get-country-data';
import { getLeadersByCountriesData } from './fetch-modules/world-leaders/get-countries-data';
import { getLeadersByCountryPromise } from './fetch-modules/world-leaders/get-country-data';
import { CountryReference } from './models/country-reference';
import { flushStore } from './utils/flush-store';
import { getCountries } from './utils/get-countries';
import { saveFiles } from './utils/save-files';

const app = express();
app.use(cors());
const port = 3000;

app.get('/', (req, res) => {
    return res.send('Hello Data!');
});

app.get('/sub-resource/:source/:subSource', async (req, res) => {
    const source = req && req.params && req.params.source;
    const subSource = req && req.params && req.params.subSource;
    const sourceObj = store.subResourceList.filter(a => a.name === source);
    const subSourceObj = sourceObj.length ? sourceObj[0].subRefs.filter(sub => sub.name === subSource) : [];
    if (subSourceObj.length) {
        subSourceObj[0].status = 1;
    }
    getAirportsHelosData(source, subSource).then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        store.errorLogger(`Unable to scrape ${source}: ${err}`);
        if (subSourceObj.length) {
            subSourceObj[0].status = -1;
        }
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

app.get('/sub-resource-list', async (req, res) => {
    return res.send(store.subResourceList);
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
        store.errorLogger(`scrape-factbook error: ${err.message}`);
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
        store.errorLogger(`scrape-leaders error: ${err.message}`);
        return res.status(500).send({ success: false });
    });
});

app.get('/dashboard', async (req, res) => {
    const dashboard: { [key: string]: { [key: string]: number } } = {
        'Ports & Related': {
            'Aircraft Types': store.aircraftTypes.count(),
            'Airlines': store.airlines.count(),
            'Airports': store.airports.count(),
            'Helicopter Landing Zones': store.helicopterLandingZones.count(),
            'Municipalities': store.municipalities.count(),
            'Routes': store.routes.count(),
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

app.get('/entities/:key', async (req, res) => {
    const key = req && req.params && req.params.key;
    if (!key) {
        return res.status(404).send({ message: `Invalid key: ${key}` });
    } else {
        const noSpacesKey = key.split(' ').join('');
        const formattedKey = noSpacesKey.substr(0, 1).toLowerCase() + noSpacesKey.substr(1);
        return res.status(200).send({ entities: store[formattedKey].chain().simplesort(consts.RDFS.label).data() });
    }
});

app.get('/entity/:key/:field/:text', async (req, res) => {
    const key = req && req.params && req.params.key;
    const field = req && req.params && req.params.field && (req.params.field === 'label' ? consts.RDFS.label : '@id');
    const text = req && req.params && req.params.text && (req.params.text.toLowerCase());
    if (!key || !field || !text) {
        return res.status(404).send({ message: `Invalid entity search criteria: ${key}, ${field}, ${text}` });
    } else {
        const noSpacesKey = key.split(' ').join('');
        const formattedKey = noSpacesKey.substr(0, 1).toLowerCase() + noSpacesKey.substr(1);
        return res.status(200).send({
            entities: store[formattedKey]
                .chain()
                .where(obj => obj[field].toLowerCase().includes(text))
                .simplesort(consts.RDFS.label)
                .data()
            });
    }
});

app.get('/ontologies', async (req, res) => {
    return res.status(200).send({ ontologies: consts.ONTOLOGIES });
});

app.get('/ontology/:ontology', async (req, res) => {
    const ontology = req && req.params && req.params.ontology;
    if (!ontology) {
        return res.status(200).send({ ontologies: consts.ONTOLOGIES });
    } else {
        if (!consts.ONTOLOGIES[ontology]) {
            consts.GET_ONTOLOGY(ontology).then(ont => {
                consts.ONTOLOGIES[ontology] = ont;
                return res.status(200).send({ ontology: consts.ONTOLOGIES[ontology] });
            });
        } else {
            return res.status(200).send({ ontology: consts.ONTOLOGIES[ontology] });
        }
    }
});

app.get('/save-files/:files', async (req, res) => {
    store.debugLogger('Save Files');
    const rawFiles = req && req.params && req.params.files;
    const ontEntSplit = rawFiles && rawFiles.split(':');
    let includeOntology = false;
    if (ontEntSplit.length === 2) {
        includeOntology = true;
        ontEntSplit.shift();
    }
    const files = ontEntSplit[0].split(',');

    if (files) {
        saveFiles(files, !includeOntology)
            .then(() => {
                return res.status(200).send({ done: true});
            })
            .catch(err => {
                store.errorLogger(`Save Files api failed: ${err.message}`);
            });

    } else {
        return res.status(404).send({ message: 'No files listed in the export options.' });
    }
});

app.listen(port, () => {
    store.debugLogger(`Data Glutton Backend listening on port ${port}!`);
});
