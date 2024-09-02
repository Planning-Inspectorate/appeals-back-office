/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapVisitType = ({ appealDetails, currentRoute }) => ({
	id: 'set-visit-type',
	display: {
		summaryListItem: {
			key: {
				text: 'Visit type'
			},
			value: {
				text: appealDetails.siteVisit?.visitType || ''
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/site-visit/${
							appealDetails.siteVisit?.visitType ? 'visit-booked' : 'schedule-visit'
						}`,
						visuallyHiddenText: 'visit type',
						attributes: { 'data-cy': 'change-set-visit-type' }
					}
				]
			},
			classes: 'appeal-visit-type'
		}
	}
});
