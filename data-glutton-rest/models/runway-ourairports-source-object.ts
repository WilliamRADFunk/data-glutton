export interface RunwayOurairportsSourceObject {
    id: number;
    refId: number;
    ident: string;
    length: number;
    width: number;
    surfMat: string;
    lighted: boolean;
    closed: boolean;
}

export interface RunwayOurairportsParamObject {
    id: number;
    refId: number;
    ident: string;
    length: number;
    width: number;
    surfMat: string;
    lighted: number;
    closed: number;
}