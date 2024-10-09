/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCaseHistory = ({ currentRoute }) => ({
	id: 'case-history',
	display: {
		summaryListItem: {
			key: {
				text: 'Case history'
			},
			actions: {
				items: [
					{
						text: 'View',
						href: `${currentRoute}/audit`,
						visuallyHiddenText: 'View case history'
					}
				]
			}
		}
	}
});
