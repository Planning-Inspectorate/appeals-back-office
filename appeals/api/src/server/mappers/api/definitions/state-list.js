const stateStub = {
	key: {
		type: 'string'
	},
	order: {
		type: 'number'
	}
};

const stateList = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			...stateStub
		}
	}
};

export const StateList = stateList;
