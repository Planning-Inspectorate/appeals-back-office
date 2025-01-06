const appealRelationship = {
	type: 'object',
	required: ['relationshipId', 'appealId', 'appealReference', 'isParentAppeal', 'linkingDate'],
	properties: {
		relationshipId: {
			type: 'number'
		},
		appealId: {
			type: 'number',
			nullable: true
		},
		appealReference: {
			type: 'string'
		},
		appealType: {
			type: 'string',
			nullable: true
		},
		isParentAppeal: {
			type: 'boolean',
			nullable: true
		},
		linkingDate: {
			type: 'string',
			format: 'date-time'
		},
		externalSource: {
			type: 'boolean',
			nullable: true
		},
		externalId: {
			type: 'string',
			nullable: true
		},
		externalAppealType: {
			type: 'string',
			nullable: true
		}
	}
};

export const AppealRelationship = appealRelationship;
