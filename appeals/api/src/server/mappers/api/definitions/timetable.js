const timetable = {
	type: 'object',
	required: ['appealTimetableId'],
	properties: {
		appealTimetableId: {
			type: 'number'
		},
		lpaQuestionnaireDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		caseResubmissionDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		ipCommentsDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		appellantStatementDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		lpaStatementDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		appellantFinalCommentsDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		lpaFinalCommentsDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		s106ObligationDueDate: {
			type: 'string',
			format: 'date-time',
			nullable: true
		}
	}
};

export const Timetable = timetable;
