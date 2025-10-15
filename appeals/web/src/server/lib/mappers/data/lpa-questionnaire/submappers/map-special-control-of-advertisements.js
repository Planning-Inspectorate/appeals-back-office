import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapSpecialControlOfAdvertisement = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'area-special-control',
		text: 'Is the site in an area of special control of advertisements?',
		value: lpaQuestionnaireData.isSiteInAreaOfSpecialControlAdverts,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/area-special-control/change`,
		editable: userHasUpdateCase
	});
