import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateIsInThePast
} from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';

/**
 * @typedef {import('#lib/representation-utilities.js').RepresentationType} RepresentationType
 */

/**
 * @typedef {Object} StatementConfig
 * @property {RepresentationType} id
 * @property {'LPA statement' | 'Appellant statement'} text
 * @property {'lpaStatement' | 'appellantStatement'} documentationKey
 * @property {'lpaStatementDueDate' | 'appellantStatementDueDate'} dueDateKey
 */

/**
 * @param {StatementConfig} config - Configuration for the statement mapper
 * @returns {import('../mapper.js').SubMapper}
 */
export const createStatementMapper = (config) => {
	return ({ appealDetails, currentRoute, request }) => {
		/** @type {Partial<{status: string, dueDate?: Date | string | undefined | null, receivedAt?: Date | string | undefined | null, representationStatus?: string | undefined | null, isRedacted?: boolean}>} */
		const statementData = appealDetails.documentationSummary?.[config.documentationKey] ?? {};
		const { status, representationStatus, isRedacted, receivedAt } = statementData;
		const dueDate = appealDetails.appealTimetable?.[config.dueDateKey];

		const statusText = (() => {
			if (!appealDetails.startedAt) {
				return 'Awaiting start date';
			}

			if (status === 'not_received') {
				return dueDate && dateIsInThePast(dateISOStringToDayMonthYearHourMinute(dueDate))
					? 'Overdue'
					: 'Awaiting statement';
			}

			switch (representationStatus?.toLowerCase()) {
				case 'awaiting_review':
					return 'Ready to review';
				case 'valid':
					return isRedacted ? 'Redacted and accepted' : 'Accepted';
				case 'incomplete':
					return 'Incomplete';
				case 'published':
					return 'Shared';
				default:
					return '';
			}
		})();

		const receivedText = (() => {
			if (!appealDetails.startedAt) {
				return 'Not applicable';
			}

			if (status === 'not_received') {
				return `Due by ${dateISOStringToDisplayDate(dueDate)}`;
			}

			const receivedAtDate = receivedAt instanceof Date ? receivedAt.toDateString() : receivedAt;

			return dateISOStringToDisplayDate(receivedAtDate);
		})();

		return documentationFolderTableItem({
			id: config.id,
			text: config.text,
			statusText,
			receivedText,
			actionHtml: mapRepresentationDocumentSummaryActionLink(
				currentRoute,
				status,
				representationStatus,
				config.id,
				request
			)
		});
	};
};
