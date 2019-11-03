import cors from 'cors';
import express from 'express';

import { consts } from './constants/constants';
import { store } from './constants/globalStore';
import { getPortsData } from './fetch-modules/all-ports/get-ports-data';
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
    const sourceObj = store.subResourceList.filter(a => a.name === source) || [];
    if (sourceObj.length) {
        sourceObj[0].status = 1;
    }
    const subSourceObj = sourceObj.length ? sourceObj[0].subRefs.filter(sub => sub.name === subSource) : [];
    if (subSourceObj.length) {
        subSourceObj[0].status = 1;
    }
    getPortsData(source, subSource).then(done => {
        return res.status(200).send({ success: true });
    }).catch(err => {
        store.errorLogger(`Unable to scrape ${source}: ${err}`);
        if (subSourceObj.length) {
            sourceObj[0].status = -1
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
    const dashboard: { [key: string]: { [key: string]: { count: number; icon: string; } } } = {
        'Factbook': {
            'Agricultural Lands': {
                count: store.agriculturalLands.count(),
                icon: 'fa fa-envira'
            },
            'Arable Lands': {
                count: store.arableLands.count(),
                icon: 'fa fa-leaf'
            },
            'Artificially Irrigated Lands': {
                count: store.artificiallyIrrigatedLands.count(),
                icon: 'fa fa-shower'
            },
            'Border Countries': {
                count: store.borderCountries.count(),
                icon: 'fa fa-object-group'
            },
            'Border Maps': {
                count: store.borderMaps.count(),
                icon: 'fa fa-map'
            },
            'Borders': {
                count: store.borders.count(),
                icon: 'fa fa-bandcamp'
            },
            'Climate Zones': {
                count: store.climateZones.count(),
                icon: 'fa fa-empire'
            },
            'Climates': {
                count: store.climates.count(),
                icon: 'fa fa-snowflake-o'
            },
            'Coasts': {
                count: store.coasts.count(),
                icon: 'fa fa-tint'
            },
            'Countries': {
                count: store.countries.count(),
                icon: 'fa fa-flag'
            },
            'Domain Areas': {
                count: store.domainAreas.count(),
                icon: 'fa fa-object-ungroup'
            },
            'Elevations': {
                count: store.elevations.count(),
                icon: 'fa fa-sort-numeric-desc'
            },
            'Forest Lands': {
                count: store.forestLands.count(),
                icon: 'fa fa-tree'
            },
            'Geographic Notes': {
                count: store.geographicNotes.count(),
                icon: 'fa fa-map-signs'
            },
            'Images': {
                count: store.images.count(),
                icon: 'fa fa-picture-o'
            },
            'Land Uses': {
                count: store.landUses.count(),
                icon: 'fa fa-pie-chart'
            },
            'Locations': {
                count: store.locations.count(),
                icon: 'fa fa-map-marker'
            },
            'Maritime Claims': {
                count: store.maritimeClaims.count(),
                icon: 'fa fa-ship'
            },
            'National Flags': {
                count: store.nationalFlags.count(),
                icon: 'fa fa-flag-o'
            },
            'Natural Hazards': {
                count: store.naturalHazards.count(),
                icon: 'fa fa-flash'
            },
            'Natural Resources': {
                count: store.naturalResources.count(),
                icon: 'fa fa-diamond'
            },
            'Other Lands': {
                count: store.otherLands.count(),
                icon: 'fa fa-area-chart'
            },
            'Permanent Crops Lands': {
                count: store.permanentCropsLands.count(),
                icon: 'fa fa-leaf'
            },
            'Permanent Pasture Lands': {
                count: store.permanentPastureLands.count(),
                icon: 'fa fa-paw'
            },
            'Region Maps': {
                count: store.regionMaps.count(),
                icon: 'fa fa-map-o'
            },
            'Terrains': {
                count: store.terrains.count(),
                icon: 'fa fa-area-chart'
            }
        },
        'Ports & Related': {
            'Aircraft Types': {
                count: store.aircraftTypes.count(),
                icon: 'fa fa-fighter-jet'
            },
            'Airlines': {
                count: store.airlines.count(),
                icon: 'fa fa-language'
            },
            'Airports': {
                count: store.airports.count(),
                icon: 'fa fa-plane'
            },
            'Helicopter Landing Zones': {
                count: store.helicopterLandingZones.count(),
                icon: 'fa fa-download'
            },
            'Municipalities': {
                count: store.municipalities.count(),
                icon: 'fa fa-building-o'
            },
            'Routes': {
                count: store.routes.count(),
                icon: 'fa fa-random'
            },
            'Runways': {
                count: store.runways.count(),
                icon: 'fa fa-road'
            },
            'Seaports': {
                count: store.seaports.count(),
                icon: 'fa fa-anchor'
            },
            'Surface Materials': {
                count: store.surfaceMaterials.count(),
                icon: 'fa fa-adjust fa-rotate-90'
            }
        },
        'World Leader': {
            'Government Offices': {
                count: store.govOffices.count(),
                icon: 'fa fa-user-circle-o'
            },
            'Persons': {
                count: store.persons.count(),
                icon: 'fa fa-user-o'
            }
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
