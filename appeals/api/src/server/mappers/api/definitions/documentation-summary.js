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
		appellantFinalComments: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		},
		lpaFinalComments: {
			type: 'object',
			properties: {
				...commonDocumentationSummaryProperties
			}
		}
	}
};

export const DocumentationSummary = documentationSummary;
