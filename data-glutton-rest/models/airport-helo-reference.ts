export interface AirportHeloReference {
	name: string;
	status: number;
	subRefs?: AirportHeloReference[];
};