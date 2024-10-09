/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppealReference = ({ appealDetails }) => ({
	id: 'appeal-reference',
	display: {
		summaryListItem: {
			key: {
				text: 'Appeal reference'
			},
			value: {
				text: appealDetails.appealReference
			},
			classes: 'appeal-appeal-reference'
		}
	}
});
