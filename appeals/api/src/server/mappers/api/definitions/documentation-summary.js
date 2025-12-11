const commonDocumentationSummaryProperties = {
	status: {
		type: 'string'
	},
	dueDate: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	receivedAt: {
		type: 'string',
		format: 'date-time',
		nullable: true
	},
	representationStatus: {
		type: 'string',
		nullable: true
	},
	counts: {
		type: 'object',
		nullable: true
	},
	isRedacted: {
		type: 'boolean',
		nullable: true
	}
};

const documentationSummary = {
	type: 'object',
	required: [],
	properties: {
		appellantCase: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		},
		lpaQuestionnaire: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		},
		ipComments: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		},
		lpaStatement: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		},
		rule6PartyStatements: {
			type: 'object',
			additionalProperties: {
				type: 'object',
				properties: {
					...commonDocumentationSummaryProperties
				}
			}
		}
	}
};

export const DocumentationSummary = documentationSummary;
