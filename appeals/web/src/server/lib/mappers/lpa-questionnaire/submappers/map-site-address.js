import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapSiteAccess = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'does-site-require-inspector-access',
		text: 'Site access required',
		value: lpaQuestionnaireData.doesSiteRequireInspectorAccess,
		valueDetails: lpaQuestionnaireData.inspectorAccessDetails,
		defaultText: 'No answer provided',
		link: `${currentRoute}/inspector-access/change/lpa`,
		editable: userHasUpdateCase,
		addCyAttribute: true
	});
