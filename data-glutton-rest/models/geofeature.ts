import { AirportProperties } from './airport-properties';

export interface GeoFeature {
    type: string;
    properties: AirportProperties;
    geometry: GeoGeometry;
}

export interface GeoGeometry {
	type: string;
	coordinates: [number, number];
}