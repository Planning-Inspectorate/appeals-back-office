import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapSiteAccess = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'does-site-require-inspector-access',
		text: 'Will the inspector need access to the appellant’s land or property?',
		value: lpaQuestionnaireData.siteAccessRequired?.isRequired,
		valueDetails: lpaQuestionnaireData.siteAccessRequired?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/lpa`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Site access required details'
	});
