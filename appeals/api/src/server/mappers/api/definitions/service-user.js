const serviceUser = {
	type: 'object',
	required: ['serviceUserId', 'firstName', 'lastName', 'email'],
	properties: {
		serviceUserId: {
			type: 'number'
		},
		firstName: {
			type: 'string'
		},
		lastName: {
			type: 'string'
		},
		organisationName: {
			type: 'string',
			nullable: true
		},
		email: {
			type: 'string',
			nullable: true
		},
		phoneNumber: {
			type: 'string',
			nullable: true
		}
	}
};

export const ServiceUser = serviceUser;
