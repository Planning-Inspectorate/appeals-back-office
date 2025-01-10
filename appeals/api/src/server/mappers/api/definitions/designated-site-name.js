const designatedSiteName = {
	type: 'object',
	required: ['id', 'name'],
	properties: {
		id: {
			type: 'number'
		},
		key: {
			type: 'string'
		},
		name: {
			type: 'string'
		}
	}
};

export const DesignatedSiteName = designatedSiteName;
