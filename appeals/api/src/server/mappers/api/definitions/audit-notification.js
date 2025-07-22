const auditNotification = {
	type: 'object',
	required: ['recipient', 'renderedContent', 'renderedSubject', 'dateCreated'],
	properties: {
		recipient: {
			type: 'string'
		},
		renderedContent: {
			type: 'string'
		},
		renderedSubject: {
			type: 'string'
		},
		subject: {
			type: 'string'
		},
		dateCreated: {
			type: 'string'
		},
		sender: {
			type: 'string'
		}
	}
};

export const AuditNotifications = {
	type: 'array',
	items: {
		...auditNotification
	}
};
