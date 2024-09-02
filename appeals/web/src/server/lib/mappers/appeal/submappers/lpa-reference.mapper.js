/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaReference = ({ appealDetails, currentRoute }) => ({
	id: 'lpa-reference',
	display: {
		summaryListItem: {
			key: {
				text: 'LPA application reference'
			},
			value: {
				text:
					appealDetails.planningApplicationReference ||
					'No LPA application reference for this appeal'
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/lpa-reference/change`,
						visuallyHiddenText: 'L P A reference',
						attributes: { 'data-cy': 'change-lpa-reference' }
					}
				]
			},
			classes: 'appeal-lpa-reference'
		}
	}
});
