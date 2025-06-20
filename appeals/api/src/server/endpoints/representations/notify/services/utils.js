import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { addDays } from '@pins/appeals/utils/business-days.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#endpoints/representations/representations.service.js').UpdatedDBRepresentation} Representation */

/**
 * @param {Representation} representation
 * @returns {string[]}
 */
export const formatReasons = (representation) => {
	return (
		representation.representationRejectionReasonsSelected?.map((selectedReason) => {
			if (selectedReason.representationRejectionReason.hasText) {
				const reasonText =
					selectedReason.representationRejectionReasonText
						?.map((reason) => reason.text)
						.filter((text) => typeof text === 'string' && text.trim() !== '')
						.join(', ') || 'No details provided';
				return `${selectedReason.representationRejectionReason.name}: ${reasonText}`;
			}
			return selectedReason.representationRejectionReason.name;
		}) ?? []
	);
};

/**
 * @param {boolean} allowResubmit
 * @param {Date | null} dueDate
 * @param {number} numDays
 * @returns {Promise<string>}
 */
export const formatExtendedDeadline = async (allowResubmit, dueDate, numDays) => {
	if (!allowResubmit) return '';

	const extendedDate = await addDays(new Date().toISOString(), numDays);

	if (!dueDate) {
		return formatDate(extendedDate, false);
	}

	const finalDate = extendedDate.getTime() > dueDate.getTime() ? extendedDate : dueDate;
	return formatDate(finalDate, false);
};

/**

 * @param {Appeal} appeal
 * @returns {string}
 */
export const formatSiteAddress = (appeal) =>
	appeal.address ? formatAddressSingleLine(appeal.address) : 'Address not available';
