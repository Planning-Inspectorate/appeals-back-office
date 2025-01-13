const listedBuilding = {
	type: 'object',
	properties: {
		id: {
			type: 'number'
		},
		listEntry: {
			type: 'string'
		},
		name: {
			type: 'string',
			nullable: true
		},
		grade: {
			type: 'string',
			nullable: true
		}
	}
};

export const ListedBuilding = listedBuilding;
