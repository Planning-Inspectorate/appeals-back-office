const invalidIncompleteReason = {
	type: 'object',
	properties: {
		name: {
			type: 'object',
			properties: {
				id: {
					type: 'number',
					nullable: true
				},
				name: {
					type: 'string'
				},
				hasText: {
					type: 'boolean'
				}
			}
		},
		text: {
			type: 'array',
			items: {
				type: 'string'
			},
			nullable: true
		}
	}
};

export const InvalidIncompleteReason = invalidIncompleteReason;
