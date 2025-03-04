import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapSiteAccess = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'does-site-require-inspector-access',
		text: 'Site access required',
		value: lpaQuestionnaireData.siteAccessRequired?.isRequired,
		valueDetails: lpaQuestionnaireData.siteAccessRequired?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/lpa`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Site access required details'
	});
