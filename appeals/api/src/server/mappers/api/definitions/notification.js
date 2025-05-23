const notification = {
	type: 'object',
	required: [
		'caseReference',
		'recipient',
		'template',
		'subject',
		'message',
		'dateCreated',
		'success'
	],
	properties: {
		caseReference: {
			type: 'string'
		},
		recipient: {
			type: 'string'
		},
		template: {
			type: 'string'
		},
		subject: {
			type: 'string'
		},
		message: {
			type: 'string'
		},
		dateCreated: {
			type: 'string'
		},
		success: {
			type: 'boolean'
		}
	}
};

export const Notifications = {
	type: 'array',
	items: {
		...notification
	}
};
