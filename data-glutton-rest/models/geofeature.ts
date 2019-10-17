import { AirportProperties } from './airport-properties';
import { SeaportProperties } from './seaport-properties';

export interface AirportGeoFeature {
    type: string;
    properties: AirportProperties;
    geometry: GeoGeometry;
}

export interface SeaportGeoFeature {
    type: string;
    properties: SeaportProperties;
    geometry: GeoGeometry;
}

export interface GeoGeometry {
	type: string;
	coordinates: [number, number];
}