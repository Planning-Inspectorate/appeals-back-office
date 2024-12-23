const invalidIncompleteReason = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: {
				type: 'object',
				properties: {
					id: {
						type: 'number'
					},
					name: {
						type: 'string'
					},
					hasText: {
						type: 'boolean'
					}
				}
			}
		}
	}
};

export const InvalidIncompleteReason = invalidIncompleteReason;
