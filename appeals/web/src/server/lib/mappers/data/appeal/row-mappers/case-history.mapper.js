/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('#app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapCaseHistory = ({ currentRoute }) =>
	textSummaryListItem({
		id: 'case-history',
		text: 'Case history',
		link: `${currentRoute}/audit`,
		editable: true,
		actionText: 'View'
	});
