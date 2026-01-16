// @ts-nocheck
// timetable for start case
export const startCaseTimetableItems = [
	{
		row: 'lpa-questionnaire-due-date',
		editable: true
	},
	{
		row: 'statement-due-date',
		editable: true
	},
	{
		row: 'ip-comments-due-date',
		editable: true
	},
	{
		row: 'statement-of-common-ground-due-date',
		editable: true
	},
	{
		row: 'proof-of-evidence-and-witnesses-due-date',
		editable: true
	},
	{
		row: 'case-management-conference-due-date',
		editable: true
	}
];

// timetable for changeappealproceduretype
export const changeAppealProcedureTypeTimetableItems = [
	{
		row: 'final-comments-due-date',
		editable: true
	},
	{
		row: 'statement-of-common-ground-due-date',
		editable: true
	},
	{
		row: 'proof-of-evidence-and-witnesses-due-date',
		editable: true
	},
	{
		row: 'case-management-conference-due-date',
		editable: true
	}
];

// timetable for inquiry
export const inquiryTimetableItems = [
	{
		row: 'lpa-questionnaire-due-date',
		editable: true
	},
	{
		row: 'statement-due-date',
		editable: true
	},
	{
		row: 'ip-comments-due-date',
		editable: true
	},
	{
		row: 'statement-of-common-ground-due-date',
		editable: true
	},
	{
		row: 'proof-of-evidence-and-witnesses-due-date',
		editable: true
	},
	{
		row: 'planning-obligation-due-date',
		editable: true
	},
	{
		row: 'case-management-conference-due-date',
		editable: true
	}
];

// timetable for linkappeals
export const linkAppealsTimetableItems = [
	{
		row: 'lpa-statement-due-date',
		editable: true
	}
];

// timetable for s78changetimetable
export const s78ChangeTimetableTimetableItems = [
	{
		row: 'lpa-questionnaire-due-date',
		editable: true
	},
	{
		row: 'lpa-statement-due-date',
		editable: true
	},
	{
		row: 'ip-comments-due-date',
		editable: true
	},
	{
		row: 'final-comments-due-date',
		editable: true
	}
];

/**
 * Replaces the given item with a new one in the provided timetableItems list
 * @param {[Object]} timetableItems
 * @param {string} oldItem item to replace
 * @param {string} newItem item to replace with
 * @returns timetableItems list with specified item replaced
 */
export const replaceTimetableItem = (timetableItems, oldItem, newItem) => {
	const updatedTimetableItems = timetableItems.map((item) => ({
		...item,
		row: item.row.replace(oldItem, newItem)
	}));

	return updatedTimetableItems;
};
