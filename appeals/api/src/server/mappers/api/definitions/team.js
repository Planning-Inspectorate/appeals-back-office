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
		},
		caseTeam: {
			type: 'object',
			nullable: true
		}
	}
};

export const Team = team;
