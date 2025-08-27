const assignedTeam = {
	type: 'object',
	required: [],
	properties: {
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
