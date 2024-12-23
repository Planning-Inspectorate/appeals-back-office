const allocation = {
	type: 'object',
	required: ['level', 'band', 'specialisms'],
	properties: {
		level: {
			type: 'string'
		},
		band: {
			type: 'number'
		},
		specialisms: {
			type: 'array',
			items: {
				type: 'string'
			}
		}
	}
};

export const Allocation = allocation;
