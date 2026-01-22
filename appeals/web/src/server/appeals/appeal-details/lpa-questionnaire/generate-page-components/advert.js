import { generateCasAdvertLpaQuestionnaireComponents } from './cas-advert.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateAdvertLpaQuestionnaireComponents = (mappedLPAQData, mappedAppealDetails) => {
	/** @type {PageComponent[]} */
	const pageComponents = generateCasAdvertLpaQuestionnaireComponents(
		mappedLPAQData,
		mappedAppealDetails
	);

	const constraintsDesignationsIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' &&
			component.parameters.attributes?.id === 'constraints-summary'
	);

	if (constraintsDesignationsIndex !== -1) {
		const rows = pageComponents[constraintsDesignationsIndex].parameters.rows;

		const changedListedBuildingDetails =
			mappedLPAQData.lpaq?.changedListedBuildingDetails?.display.summaryListItem;

		rows.splice(1, 0, changedListedBuildingDetails);
	}

	return pageComponents;
};
