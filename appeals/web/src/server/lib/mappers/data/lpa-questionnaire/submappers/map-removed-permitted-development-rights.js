import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRemovedPermittedDevelopmentRights = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'pd-rights',
		text: 'Article 4',
		// @ts-ignore
		value: lpaQuestionnaireData.article4AffectedDevelopmentRights !== null,
		link: `${currentRoute}/pd-rights`,
		editable: userHasUpdateCase
	});
