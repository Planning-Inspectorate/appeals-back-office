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
			href: `${currentRoute}/site-visit/schedule-visit`
		}
	});
};
