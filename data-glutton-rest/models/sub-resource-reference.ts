export interface SubResourceReference {
	name: string;
	status: number;
	subRefs?: SubResourceReference[];
};