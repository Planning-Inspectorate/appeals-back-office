import { mapStatusText } from '#lib/appeal-status.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('#app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealStatus = ({ appealDetails }) => ({
	id: 'appeal-status',
	display: {
		summaryListItem: {
			key: {
				text: 'Appeal status'
			},
			value: {
				text: appealDetails.appealStatus
			},
			classes: 'appeal-appeal-status'
		},
		statusTag: {
			status: (() => {
				if (!appealDetails?.appealStatus || !appealDetails?.appealType) {
					return '';
				}

				return mapStatusText(
					appealDetails.appealStatus,
					appealDetails.appealType,
					appealDetails.procedureType
				);
			})(),
			classes: 'govuk-!-margin-bottom-4'
		}
	}
});
