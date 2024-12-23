const address = {
	type: 'object',
	required: ['addressLine1', 'postCode'],
	properties: {
		addressId: {
			type: 'number'
		},
		addressLine1: {
			type: 'string'
		},
		addressLine2: {
			type: 'string',
			nullable: true
		},
		addressTown: {
			type: 'string',
			nullable: true
		},
		addressCounty: {
			type: 'string',
			nullable: true
		},
		postCode: {
			type: 'string'
		}
	}
};

export const Address = address;
