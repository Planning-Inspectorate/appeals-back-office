import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapRemovedPermittedDevelopmentRights = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'pd-rights-removed',
		text: 'Were any permitted development rights removed with the direction?',
		value: !!lpaQuestionnaireData.article4AffectedDevelopmentRights,
		valueDetails: lpaQuestionnaireData.article4AffectedDevelopmentRights,
		defaultText: '',
		link: `${currentRoute}/pd-rights-removed/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Permitted development rights removed'
	});
