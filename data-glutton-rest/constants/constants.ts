import * as fs from 'graceful-fs';
import path from 'path';
import {JsonLdProcessor} from 'jsonld';

const AIRCRAFT_ONT_PATH = 'http://williamrobertfunk.com/ontologies/aircraft#';
const AIRPORT_ONT_PATH = 'http://williamrobertfunk.com/ontologies/airport#';
const ASSET_ONT_PATH = 'http://www.daedafusion.com/Asset#';
const COUNTRY_ONT_PATH = 'http://williamrobertfunk.com/ontologies/country#';
const FACTBOOK_ONT_PATH = 'http://williamrobertfunk.com/ontologies/world-factbook#';
const FOAF_ONT_PATH = 'http://xmlns.com/foaf/0.1/';
const GENERAL_ONT_PATH = 'http://williamrobertfunk.com/ontologies/general#';
const GEO_ONT_PATH = 'http://www.w3.org/2003/01/geo/wgs84_pos#';
const IMAGE_ONT_PATH = 'http://williamrobertfunk.com/ontologies/image#';
const LEADERS_ONT_PATH = 'http://williamrobertfunk.com/ontologies/world-leaders#';
const MAIN_INSTANCE_PATH = 'http://williamrobertfunk.com/instance/';
const MUNICIPALITY_ONT_PATH = 'http://williamrobertfunk.com/ontologies/municipality#';
const WGS84_POS = {
	ALT: GEO_ONT_PATH + 'alt',
	LAT: GEO_ONT_PATH + 'lat',
	LAT_LONG: GEO_ONT_PATH + 'lat_long',
	LOCATION: GEO_ONT_PATH + 'location',
	LONG: GEO_ONT_PATH + 'long',
	POINT: GEO_ONT_PATH + 'Point',
	SPATIAL_THING: GEO_ONT_PATH + 'SpatialThing'
};

const BASE = {
	COUNTRY_BLACKLIST: [
		'please select a country to view',
		'world'
	],
	DATA_REQUEST_TIMEOUT: 40000,
	URL_BASE_FACTBOOK: 'https://www.cia.gov/library/publications/the-world-factbook/',
	URL_COUNTRY_BASE_FACTBOOK: 'https://www.cia.gov/library/publications/the-world-factbook/geos/',
	URL_LEADER_BASE: 'https://www.cia.gov/library/publications/resources/world-leaders-1/'
};

const ONTOLOGY: { [key: string]: string } = {
	// Ontology definition paths for (predicate) datatype properties
	DT_AREA_COMPARATIVE: COUNTRY_ONT_PATH + 'areaComparative',
	DT_AREA_RANK: COUNTRY_ONT_PATH + 'areaRank',
	DT_BACKGROUND: COUNTRY_ONT_PATH + 'background',
	DT_BORDER_LENGTH: COUNTRY_ONT_PATH + 'borderLength',
	DT_CLIMATE_ZONE_DESCRIPTION: COUNTRY_ONT_PATH + 'climateZoneDescription',
	DT_CLIMATE_ZONE_NAME: COUNTRY_ONT_PATH + 'climateZoneName',
	DT_COLLECTION_TIMESTAMP: ASSET_ONT_PATH + 'collectionTimestamp',
	DT_CONDITION: GENERAL_ONT_PATH + 'condition',
	DT_CONTENTS: IMAGE_ONT_PATH + 'contents',
	DT_CONTENT_DESCRIPTION: IMAGE_ONT_PATH + 'contentDescription',
	DT_CONTIGUOUS_ZONE: COUNTRY_ONT_PATH + 'contiguousZone',
	DT_CONTINENTAL_SHELF: COUNTRY_ONT_PATH + 'continentalShelf',
	DT_CONTINENTAL_SHELF_MODIFIER: COUNTRY_ONT_PATH + 'continentalShelfModifier',
	DT_DESCRIPTION: GENERAL_ONT_PATH + 'description',
	DT_EXCLUSIVE_ECONOMIC_ZONE: COUNTRY_ONT_PATH + 'exclusiveEconomicZone',
	DT_EXCLUSIVE_FISHING_ZONE: COUNTRY_ONT_PATH + 'exclusiveFishingZone',
	DT_FIRST_NAME: FOAF_ONT_PATH + 'firstName',
	DT_GEC_CODE: COUNTRY_ONT_PATH + 'countryCodeGEC',
	DT_HAZARD_DESCRIPTION: COUNTRY_ONT_PATH + 'hazardDescription',
	DT_HIGHEST_POINT: GENERAL_ONT_PATH + 'highestPoint',
	DT_HIGHEST_POINT_DESCRIPTION: GENERAL_ONT_PATH + 'highestPointDescription',
	DT_IATA_CODE: AIRPORT_ONT_PATH + 'iataCode',
	DT_IMAGE_DIMENSIONS: IMAGE_ONT_PATH + 'imageDimensions',
	DT_IMAGE_SIZE: IMAGE_ONT_PATH + 'imageSize',
	DT_ICAO_CODE: AIRPORT_ONT_PATH + 'icaoCode',
	DT_IS_COMPOSITE: GENERAL_ONT_PATH + 'isComposite',
	DT_ISO_CODE: COUNTRY_ONT_PATH + 'countryCodeISO',
	DT_LAND_AREA: COUNTRY_ONT_PATH + 'landArea',
	DT_LAST_NAME: FOAF_ONT_PATH + 'lastName',
	DT_LAST_ESTIMATED: COUNTRY_ONT_PATH + 'lastEstimated',
	DT_LENGTH: GENERAL_ONT_PATH + 'length',
	DT_LENGTH_MODIFIER: GENERAL_ONT_PATH + 'lengthModifier',
	DT_LOCATION_DESCRIPTION: GENERAL_ONT_PATH + 'locationDescription',
	DT_LOCATION_REF_DESCRIPTION: COUNTRY_ONT_PATH + 'locationReferenceDescription',
	DT_LOCATOR_URI: IMAGE_ONT_PATH + 'locatorURI',
	DT_LOWEST_POINT: GENERAL_ONT_PATH + 'lowestPoint',
	DT_LOWEST_POINT_DESCRIPTION: GENERAL_ONT_PATH + 'lowestPointDescription',
	DT_MAP_REFERENCES: COUNTRY_ONT_PATH + 'mapReferences',
	DT_MATERIAL: GENERAL_ONT_PATH + 'material',
	DT_MEAN_ELEVATION: GENERAL_ONT_PATH + 'meanElevation',
	DT_MIME_TYPE: ASSET_ONT_PATH + 'mimeType',
	DT_NAME: FOAF_ONT_PATH + 'name',
	DT_NUM_OF_LAND_SITE_1: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize1',
	DT_NUM_OF_LAND_SITE_2: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize2',
	DT_NUM_OF_LAND_SITE_3: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize3',
	DT_NUM_OF_LAND_SITE_4: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize4',
	DT_NUM_OF_LAND_SITE_5: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize5',
	DT_NUM_OF_LAND_SITE_6: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize6',
	DT_NUM_OF_LAND_SITE_7: AIRCRAFT_ONT_PATH + 'numberOfLandingPointSize7',
	DT_PERCENTAGE: GENERAL_ONT_PATH + 'percentage',
	DT_POPULATION_DISTRIBUTION: COUNTRY_ONT_PATH + 'populationDistribution',
	DT_REGION_ISO_CODE: COUNTRY_ONT_PATH + 'regionCodeISO',
	DT_REGION_SPECIFIC: LEADERS_ONT_PATH + 'regionSpecific',
	DT_RELATIVE_SIZE: AIRPORT_ONT_PATH + 'relativeSize',
	DT_RESOURCE_NAME: COUNTRY_ONT_PATH + 'resourceName',
	DT_STATUS: AIRPORT_ONT_PATH + 'status',
	DT_SUPPLEMENTAL_EXPLANATION: COUNTRY_ONT_PATH + 'supplementalExplanation',
	DT_TERRITORIAL_SEA: COUNTRY_ONT_PATH + 'territorialSea',
	DT_TITLE: LEADERS_ONT_PATH + 'title',
	DT_TOTAL_AREA: COUNTRY_ONT_PATH + 'totalArea',
	DT_TOTAL_BORDER: COUNTRY_ONT_PATH + 'totalLandBorder',
	DT_TOTAL_BORDER_COUNTRIES: COUNTRY_ONT_PATH + 'totalBorderCountries',
	DT_TYPE: AIRPORT_ONT_PATH + 'type',
	DT_UNIT: GENERAL_ONT_PATH + 'unit',
	DT_WATER_AREA: COUNTRY_ONT_PATH + 'waterArea',
	DT_WIDTH: GENERAL_ONT_PATH + 'width',
	DT_WIKI_URI: GENERAL_ONT_PATH + 'wikiURI',
	// Base path for all things ontology definition
	AIRCRAFT_ONT_PATH,
	AIRPORT_ONT_PATH,
	ASSET_ONT_PATH,
	COUNTRY_ONT_PATH,
	FACTBOOK_ONT_PATH,
	FOAF_ONT_PATH,
	GENERAL_ONT_PATH,
	GEO_ONT_PATH,
	IMAGE_ONT_PATH,
	LEADERS_ONT_PATH,
	MUNICIPALITY_ONT_PATH,
	// Ontology definition paths for (predicate) object/relation properties
	HAS_AGRICULTURAL_LAND: COUNTRY_ONT_PATH + 'hasAgriculturalLand',
	HAS_AIRPORT: AIRPORT_ONT_PATH + 'hasAirport',
	HAS_APPOINTED_GOVERNMENT_OFFICE: LEADERS_ONT_PATH + 'appointedGovernmentOffice',
	HAS_ARABLE_LAND: COUNTRY_ONT_PATH + 'hasArableLand',
	HAS_ARTIFICIALLY_IRRIGATED_LAND: COUNTRY_ONT_PATH + 'hasArtificiallyIrrigatedLand',
	HAS_BORDER: COUNTRY_ONT_PATH + 'hasBorder',
	HAS_BORDER_COUNTRY: COUNTRY_ONT_PATH + 'hasBorderCountryPair',
	HAS_BORDER_MAP: COUNTRY_ONT_PATH + 'hasBorderMap',
	HAS_CLIMATE: COUNTRY_ONT_PATH + 'hasClimate',
	HAS_CLIMATE_ZONE: COUNTRY_ONT_PATH + 'hasClimateZone',
	HAS_COAST: COUNTRY_ONT_PATH + 'hasCoast',
	HAS_COUNTRY: COUNTRY_ONT_PATH + 'hasCountry',
	HAS_DOMAIN_AREA: COUNTRY_ONT_PATH + 'hasDomainArea',
	HAS_ELEVATION: GENERAL_ONT_PATH + 'hasElevation',
	HAS_FLAG: COUNTRY_ONT_PATH + 'hasNationalFlag',
	HAS_FOREST_LAND: COUNTRY_ONT_PATH + 'hasForestLand',
	HAS_GEOGRAPHIC_NOTE: COUNTRY_ONT_PATH + 'hasGeographicNote',
	HAS_GOVERNMENT_OFFICE: LEADERS_ONT_PATH + 'hasGovernmentOffice',
	HAS_GOVERNMENT_OFFICIAL: LEADERS_ONT_PATH + 'hasGovernmentOfficial',
	HAS_HELO_LAND_ZONE: AIRCRAFT_ONT_PATH + 'hasHelicopterLandingZone',
	HAS_LAND_USE: COUNTRY_ONT_PATH + 'hasLandUse',
	HAS_LOCATION: GENERAL_ONT_PATH + 'hasLocation',
	HAS_MARITIME_CLAIM: COUNTRY_ONT_PATH + 'hasMaritimeClaim',
	HAS_MUNICIPALITY: MUNICIPALITY_ONT_PATH + 'hasMunicipality',
	HAS_NATURAL_HAZARD: COUNTRY_ONT_PATH + 'hasNaturalHazard',
	HAS_NATURAL_RESOURCE: COUNTRY_ONT_PATH + 'hasNaturalResource',
	HAS_OTHER_LAND: COUNTRY_ONT_PATH + 'hasOtherLand',
	HAS_PERMANENT_CROPS_LAND: COUNTRY_ONT_PATH + 'hasPermanentCropsLand',
	HAS_PERMANENT_PASTURE_LAND: COUNTRY_ONT_PATH + 'hasPermanentPastureLand',
	HAS_REGION_MAP: COUNTRY_ONT_PATH + 'hasRegionMap',
	HAS_RUNWAY: AIRPORT_ONT_PATH + 'hasRunway',
	HAS_SUPPLEMENTAL_IMG: COUNTRY_ONT_PATH + 'hasSupplementalImage',
	HAS_SURFACE_MATERIAL: AIRPORT_ONT_PATH + 'hasSurfaceMaterial',
	HAS_TERRAIN: COUNTRY_ONT_PATH + 'hasTerrain',
	// Instance definition paths

	INST_AGRICULTURAL_LAND: MAIN_INSTANCE_PATH + 'AgriculturalLand/',
	INST_AIRLINE: MAIN_INSTANCE_PATH + 'Airline/',
	INST_AIRPORT: MAIN_INSTANCE_PATH + 'Airport/',
	INST_ARABLE_LAND: MAIN_INSTANCE_PATH + 'ArableLand/',
	INST_ARTIFICIALLY_IRRIGATED_LAND: MAIN_INSTANCE_PATH + 'ArtificiallyIrrigatedLand/',
	INST_BORDER: MAIN_INSTANCE_PATH + 'Border/',
	INST_BORDER_COUNTRY: MAIN_INSTANCE_PATH + 'BorderCountryPair/',
	INST_BORDER_MAP: MAIN_INSTANCE_PATH + 'BorderMap/',
	INST_CLIMATE: MAIN_INSTANCE_PATH + 'Climate/',
	INST_CLIMATE_ZONE: MAIN_INSTANCE_PATH + 'ClimateZone/',
	INST_COAST: MAIN_INSTANCE_PATH + 'Coast/',
	INST_COUNTRY: MAIN_INSTANCE_PATH + 'Country/',
	INST_DOMAIN_AREA: MAIN_INSTANCE_PATH + 'DomainArea/',
	INST_ELEVATION: MAIN_INSTANCE_PATH + 'Elevation/',
	INST_FLAG: MAIN_INSTANCE_PATH + 'NationalFlag/',
	INST_FOREST_LAND: MAIN_INSTANCE_PATH + 'ForestLand/',
	INST_GEOGRAPHIC_NOTE: MAIN_INSTANCE_PATH + 'GeographicNote/',
	INST_GEO_LOCATION: MAIN_INSTANCE_PATH + 'Location/',
	INST_GOVERNMENT_OFFICE: MAIN_INSTANCE_PATH + 'GovernmentOffice/',
	INST_HELO_LAND_ZONE: MAIN_INSTANCE_PATH + 'HelicopterLandingZone/',
	INST_IMAGE: MAIN_INSTANCE_PATH + 'Image/',
	INST_LAND_USE: MAIN_INSTANCE_PATH + 'LandUse/',
	INST_MARITIME_CLAIM: MAIN_INSTANCE_PATH + 'MaritimeClaim/',
	INST_MUNICIPALITY: MAIN_INSTANCE_PATH + 'Municipality/',
	INST_NATURAL_HAZARD: MAIN_INSTANCE_PATH + 'NaturalHazard/',
	INST_NATURAL_RESOURCE: MAIN_INSTANCE_PATH + 'NaturalResource/',
	INST_OTHER_LAND: MAIN_INSTANCE_PATH + 'OtherLand/',
	INST_PERMANENT_CROPS_LAND: MAIN_INSTANCE_PATH + 'PermanentCropsLand/',
	INST_PERMANENT_PASTURE_LAND: MAIN_INSTANCE_PATH + 'PermanentPastureLand/',
	INST_PERSON: MAIN_INSTANCE_PATH + 'Person/',
	INST_REGION_MAP: MAIN_INSTANCE_PATH + 'RegionMap/',
	INST_RUNWAY: MAIN_INSTANCE_PATH + 'Runway/',
	INST_SURFACE_MATERIAL: MAIN_INSTANCE_PATH + 'SurfaceMaterial/',
	INST_TERRAIN: MAIN_INSTANCE_PATH + 'Terrain/',
	// Base path for all things instance definition
	MAIN_INSTANCE_PATH,
	// Ontology class definition paths
	ONT_AGRICULTURAL_LAND: COUNTRY_ONT_PATH + 'AgriculturalLand',
	ONT_AIRLINE: AIRPORT_ONT_PATH + 'Airline',
	ONT_AIRPORT: AIRPORT_ONT_PATH + 'Airport',
	ONT_ARABLE_LAND: COUNTRY_ONT_PATH + 'ArableLand',
	ONT_ARTIFICIALLY_IRRIGATED_LAND: COUNTRY_ONT_PATH + 'ArtificiallyIrrigatedLand',
	ONT_BORDER: COUNTRY_ONT_PATH + 'Border',
	ONT_BORDER_COUNTRY: COUNTRY_ONT_PATH + 'BorderCountryPair',
	ONT_BORDER_MAP: COUNTRY_ONT_PATH + 'BorderMap',
	ONT_CLIMATE: COUNTRY_ONT_PATH + 'Climate',
	ONT_CLIMATE_ZONE: COUNTRY_ONT_PATH + 'ClimateZone',
	ONT_COAST: COUNTRY_ONT_PATH + 'Coast',
	ONT_COUNTRY: COUNTRY_ONT_PATH + 'Country',
	ONT_DOMAIN_AREA: COUNTRY_ONT_PATH + 'DomainArea',
	ONT_ELEVATION: GENERAL_ONT_PATH + 'Elevation',
	ONT_FLAG: COUNTRY_ONT_PATH + 'NationalFlag',
	ONT_FOREST_LAND: COUNTRY_ONT_PATH + 'ForestLand',
	ONT_GEOGRAPHIC_NOTE: COUNTRY_ONT_PATH + 'GeographicNote',
	ONT_GEO_LOCATION: GENERAL_ONT_PATH + 'Location',
	ONT_GOVERNMENT_OFFICE: LEADERS_ONT_PATH + 'GovernmentOffice',
	ONT_HELO_LAND_ZONE: AIRCRAFT_ONT_PATH + 'HelicopterLandingZone',
	ONT_IMAGE: IMAGE_ONT_PATH + 'Image',
	ONT_LAND_USE: COUNTRY_ONT_PATH + 'LandUse',
	ONT_MARITIME_CLAIM: COUNTRY_ONT_PATH + 'MaritimeClaim',
	ONT_MUNICIPALITY: MUNICIPALITY_ONT_PATH + 'Municipality',
	ONT_NATURAL_HAZARD: COUNTRY_ONT_PATH + 'NaturalHazard',
	ONT_NATURAL_RESOURCE: COUNTRY_ONT_PATH + 'NaturalResource',
	ONT_OTHER_LAND: COUNTRY_ONT_PATH + 'OtherLand',
	ONT_PERMANENT_CROPS_LAND: COUNTRY_ONT_PATH + 'PermanentCropsLand',
	ONT_PERMANENT_PASTURE_LAND: COUNTRY_ONT_PATH + 'PermanentPastureLand',
	ONT_PERSON: LEADERS_ONT_PATH + 'Person',
	ONT_REGION_MAP: COUNTRY_ONT_PATH + 'RegionMap',
	ONT_RUNWAY: AIRPORT_ONT_PATH + 'Runway',
	ONT_SURFACE_MATERIAL: AIRPORT_ONT_PATH + 'SurfaceMaterial',
	ONT_TERRAIN: COUNTRY_ONT_PATH + 'Terrain'
};

const RDFS = {
	label: 'http://www.w3.org/2000/01/rdf-schema#label'
};

const file = fs.readFileSync(path.join('constants', 'ontology', 'daedafusion-asset.schema.jsonld'), 'utf8');
const json = JSON.parse(file);
const context = json['@context'];
const graph = json['@graph'];
JsonLdProcessor.flatten(graph, context).then(res => {
	console.log('res', res);
});


const ONTOLOGIES = {
	'daedafusion-asset': fs.readFileSync(path.join('constants', 'ontology', 'daedafusion-asset.rdf'), 'utf8'),
	'dbpedia-country': fs.readFileSync(path.join('constants', 'ontology', 'dbpedia-country.rdf'), 'utf8'),
	'foaf-foaf': fs.readFileSync(path.join('constants', 'ontology', 'foaf-foaf.rdf'), 'utf8'),
	'funk-aircraft': fs.readFileSync(path.join('constants', 'ontology', 'funk-aircraft.rdf'), 'utf8'),
	'funk-blade-ref': fs.readFileSync(path.join('constants', 'ontology', 'funk-blade-ref.rdf'), 'utf8'),
	'funk-country': fs.readFileSync(path.join('constants', 'ontology', 'funk-country.rdf'), 'utf8'),
	'funk-general': fs.readFileSync(path.join('constants', 'ontology', 'funk-general.rdf'), 'utf8'),
	'funk-image': fs.readFileSync(path.join('constants', 'ontology', 'funk-image.rdf'), 'utf8'),
	'funk-municipality': fs.readFileSync(path.join('constants', 'ontology', 'funk-municipality.rdf'), 'utf8'),
	'funk-world-leaders': fs.readFileSync(path.join('constants', 'ontology', 'funk-world-leaders.rdf'), 'utf8'),
	'w3-owl': fs.readFileSync(path.join('constants', 'ontology', 'w3-owl.rdf'), 'utf8'),
	'w3-wgs84_pos': fs.readFileSync(path.join('constants', 'ontology', 'w3-wgs84_pos.rdf'), 'utf8')
};

class Constants {
	public BASE = BASE;
	public ONTOLOGY = ONTOLOGY;
	public ONTOLOGIES = ONTOLOGIES;
	public RDFS = RDFS;
	public WGS84_POS = WGS84_POS;
}

export const consts = new Constants();
