export interface CountryReference {
	dataCode: string;
	isoCode: string;
	name: string;
	status: { 'CIA World Factbook': number; 'CIA World Leaders': number; };
};