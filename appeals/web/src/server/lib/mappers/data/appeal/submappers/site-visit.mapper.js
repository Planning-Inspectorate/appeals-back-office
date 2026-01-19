import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { button } from '#lib/mappers/components/instructions/button.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisit = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'set-up-site-visit ';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return button({
		id,
		text: 'Set up site visit',
		buttonOptions: {
			href: `${currentRoute}/site-visit-v2/schedule-visit`
		}
	});
};

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteVisitOld = ({ appealDetails, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'site-visit',
		text: 'Site visit',
		value: {
			html: 'Not set up'
		},
		link: `/appeals-service/appeal-details/${appealDetails.appealId}/site-visit-v2/schedule-visit`,
		editable: userHasUpdateCasePermission,
		actionText: 'Set up'
	});
