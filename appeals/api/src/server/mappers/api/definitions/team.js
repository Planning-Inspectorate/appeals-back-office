const team = {
	type: 'object',
	required: [],
	properties: {
		caseOfficer: {
			type: 'string',
			format: 'uuid',
			nullable: true
		},
		inspector: {
			type: 'string',
			format: 'uuid',
			nullable: true
		}
	}
};

export const Team = team;
