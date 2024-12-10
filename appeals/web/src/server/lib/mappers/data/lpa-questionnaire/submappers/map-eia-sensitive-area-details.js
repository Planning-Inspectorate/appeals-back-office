import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaSensitiveAreaDetails = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'eia-sensitive-area-details',
		text: 'In, partly in, or likely to affect a sensitive area',
		value:
			(lpaQuestionnaireData.eiaSensitiveAreaDetails &&
				lpaQuestionnaireData.eiaSensitiveAreaDetails?.length > 0) ||
			false,
		valueDetails: lpaQuestionnaireData.eiaSensitiveAreaDetails,
		defaultText: 'No answer provided',
		link: `${currentRoute}/environmental-impact-assessment/sensitive-area-details/change`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-eia-sensitive-area-details',
		withShowMore: true,
		showMoreLabelText: 'In, partly in, or likely to affect a sensitive area details'
	});
