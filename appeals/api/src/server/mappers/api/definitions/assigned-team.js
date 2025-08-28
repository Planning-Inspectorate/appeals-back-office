const assignedTeam = {
	type: 'object',
	required: [],
	properties: {
		id: {
			type: 'Number',
			nullable: true
		},
		name: {
			type: 'string',
			nullable: true
		},
		email: {
			type: 'string',
			format: 'email',
			nullable: true
		}
	}
};

export const AssignedTeam = assignedTeam;
