import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { addDays } from '#utils/business-days.js';
import formatDate from '#utils/date-formatter.js';

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
 * @returns {Promise<string>}
 */
export const formatExtendedDeadline = async (allowResubmit) => {
	if (!allowResubmit) {
		return '';
	}

	const date = await addDays(new Date().toISOString(), 7);
	return formatDate(date, false);
};

/**

 * @param {Appeal} appeal
 * @returns {string}
 */
export const formatSiteAddress = (appeal) =>
	appeal.address ? formatAddressSingleLine(appeal.address) : 'Address not available';
