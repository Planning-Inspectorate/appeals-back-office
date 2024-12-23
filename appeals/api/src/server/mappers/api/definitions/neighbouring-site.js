import { Address } from './address.js';

const neighbouringSite = {
	type: 'object',
	required: ['siteId', 'source', 'address'],
	properties: {
		siteId: {
			type: 'number'
		},
		source: {
			type: 'string'
		},
		address: Address
	}
};

export const NeighbouringSite = neighbouringSite;
