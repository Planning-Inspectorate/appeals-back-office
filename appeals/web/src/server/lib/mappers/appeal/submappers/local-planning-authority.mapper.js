/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({ appealDetails, currentRoute }) => ({
	id: 'local-planning-authority',
	display: {
		summaryListItem: {
			key: {
				text: 'Local planning authority (LPA)'
			},
			value: {
				text: appealDetails.localPlanningDepartment
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/change-appeal-details/local-planning-authority`,
						visuallyHiddenText: 'local planning authority (LPA)',
						attributes: { 'data-cy': 'change-local-planning-authority' }
					}
				]
			},
			classes: 'appeal-local-planning-authority'
		}
	}
});
