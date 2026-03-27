import { generateCasAdvertLpaQuestionnaireComponents } from './cas-advert.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @returns {PageComponent[]}
 */
export const generateAdvertLpaQuestionnaireComponents = (mappedLPAQData) => {
	/** @type {PageComponent[]} */
	const pageComponents = generateCasAdvertLpaQuestionnaireComponents(mappedLPAQData);

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
