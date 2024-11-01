import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapStartedAt = ({ appealDetails, currentRoute }) => {
	let startedAtActionLink = null;

	if (appealDetails.validAt) {
		if (appealDetails.startedAt) {
			if (appealDetails.documentationSummary?.lpaQuestionnaire?.status === 'not_received') {
				startedAtActionLink = {
					text: 'Change',
					href: `${currentRoute}/start-case/change`,
					attributes: { 'data-cy': 'change-start-case-date' }
				};
			}
		} else {
			startedAtActionLink = {
				text: 'Add',
				href: `${currentRoute}/start-case/add`,
				visuallyHiddenText: 'The date the case was started',
				attributes: { 'data-cy': 'add-start-case-date' }
			};
		}
	}

	return {
		id: 'start-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Start date'
				},
				value: {
					html: appealDetails.validAt
						? appealDetails.startedAt
							? dateISOStringToDisplayDate(appealDetails.startedAt)
							: 'Not added'
						: ''
				},
				actions: {
					items: startedAtActionLink && [startedAtActionLink]
				},
				classes: 'appeal-start-date'
			}
		}
	};
};
