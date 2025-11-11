const teamNames = {
	type: 'object',
	required: [],
	properties: {
		caseOfficerId: {
			type: 'string',
			format: 'uuid',
			nullable: true
		},
		caseOfficerName: {
			type: 'string',
			nullable: true
		},
		inspectorId: {
			type: 'string',
			format: 'uuid',
			nullable: true
		},
		inspectorName: {
			type: 'string',
			nullable: true
		},
		prevUserName: {
			type: 'string',
			nullable: true
		}
	}
};

export const TeamNames = teamNames;
