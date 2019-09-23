export interface AirportSourceReference {
    name: string;
    status: number;
    subRefs: AirportSourceReference[];
}