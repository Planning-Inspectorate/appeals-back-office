import { isDefined } from '#lib/ts-utilities.js';

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
export const generateLdcLpaQuestionnaireComponents = (mappedLPAQData, mappedAppealDetails) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	//Needed in PART 3 causes ts-check to error if not included here
	console.log('mappedAppealDetails', mappedAppealDetails);

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id: 'constraints-summary'
			},
			card: {
				title: {
					text: '1. Constraints, designations and other issues'
				}
			},
			rows: [mappedLPAQData.lpaq?.isCorrectAppealType?.display.summaryListItem].filter(isDefined)
		}
	});

	return pageComponents;
};
