export const CASE_HISTORY_STATES = Object.freeze({
	completedState: [
		{
			detail: 'Appeal decision: {caseRef} sent to LPA',
			emailLink: 'yes',
			emailSubject: 'Subject: Appeal decision: {caseRef}',
			emailBody: 'We have made a decision on this appeal.'
		},
		{
			detail: 'Appeal decision: {caseRef} sent to agent',
			emailLink: 'yes',
			emailSubject: 'Subject: Appeal decision: {caseRef}',
			emailBody: 'We have also informed the local planning authority of the decision.'
		},
		{
			detail: 'Case progressed to Complete',
			emailLink: 'no',
			emailSubject: '',
			emailBody: ''
		},
		{
			detail: 'Decision issued: Allowed',
			emailLink: 'no',
			emailSubject: '',
			emailBody: ''
		}
	],

	shareFinalComments: [
		{
			detail: `We have received the appellant's final comments: {caseRef} sent to LPA`,
			emailLink: 'yes',
			emailSubject: `Subject: We have received the appellant's final comments: {caseRef}`,
			emailBody: `We have received the appellant's final comments.`
		},
		{
			detail: `We have received the local planning authority's final comments: {caseRef} sent to agent`,
			emailLink: 'yes',
			emailSubject: `Subject: We have received the local planning authority's final comments: {caseRef}`,
			emailBody: `We have received the local planning authority's final comments.`
		},
		{
			detail: 'Final comments shared',
			emailLink: 'no',
			emailSubject: '',
			emailBody: ''
		}
	]
});

export const STATE_KEYS = Object.freeze(Object.keys(CASE_HISTORY_STATES));
