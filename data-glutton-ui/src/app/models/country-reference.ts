export interface CountryReference {
    dataCode: string;
    isoCode: string;
    name: string;
    status: { 'Airports/Helos': number; 'CIA World Factbook': number; 'CIA World Leaders': number; };
}