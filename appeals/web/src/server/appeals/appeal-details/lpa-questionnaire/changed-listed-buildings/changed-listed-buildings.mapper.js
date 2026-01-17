/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {string} currentListedBuilding
 * @returns {PageContent}
 */
export function addChangedListedBuildingPage(appealData, currentListedBuilding) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Changed listed building entry number',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference} - add changed listed building`,
		heading: `Changed listed building entry number`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'changedListedBuilding',
					name: 'changedListedBuilding',
					type: 'text',
					hint: {
						text: 'This is a 7 digit number from Historic England'
					},
					value: currentListedBuilding ?? ''
				}
			}
		]
	};

	return pageContent;
}
/**
 *
 * @param {Appeal} appealData
 * @param {string} currentListedBuilding
 */
export function addChangedListedBuildingCheckAndConfirmPage(appealData, currentListedBuilding) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and add changed listed building`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/add`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check details and add changed listed building',
		submitButtonProperties: {
			text: 'Add changed listed building'
		},
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Changed listed building'
							},
							value: {
								html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${currentListedBuilding}" class="govuk-link" target="_blank">${currentListedBuilding}</a>`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/add`,
										visuallyHiddenText: 'listed building number'
									}
								]
							}
						}
					]
				}
			}
		]
	};
	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {LpaQuestionnaire} lpaQuestionnaireData
 */
export function manageChangedListedBuildingPage(appealData, lpaQuestionnaireData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const changedListedBuildings = lpaQuestionnaireData.listedBuildingDetails
		?.filter((lb) => lb.affectsListedBuilding === false)
		?.map(listedBuildingTableRowFormatter);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Changed listed buildings',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Changed listed buildings',
		pageComponents: [
			{
				type: 'table',
				parameters: {
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [
						{ text: 'Listed building number' },
						{ text: 'Action', classes: 'govuk-!-text-align-right' }
					],
					rows: changedListedBuildings
				}
			}
		]
	};
	return pageContent;
}

/**
 * @param {{id: number, listEntry: string}} building
 */
function getListedBuildingActions(building) {
	return [
		{
			text: 'Change',
			href: `change/${building.id}`,
			visuallyHiddenText: `listed building ${building.listEntry}`
		},
		{
			text: 'Remove',
			href: `remove/${building.id}`,
			visuallyHiddenText: `listed building ${building.listEntry}`
		}
	];
}

/**
 * @param {{id: number, listEntry: string}} building
 */
function listedBuildingTableRowFormatter(building) {
	const actions = getListedBuildingActions(building);

	return [
		{
			html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${building.listEntry}" class="govuk-link" target="_blank">${building.listEntry}</a>`
		},
		{
			html: `<ul class="govuk-summary-list__actions-list">
				${actions
					.map(
						(action) => `
					<li class="govuk-summary-list__actions-list-item">
						<a href="${action.href}" class="govuk-link">
							${action.text}<span class="govuk-visually-hidden"> ${action.visuallyHiddenText}</span>
						</a>
					</li>
				`
					)
					.join('')}
			</ul>`,
			classes: 'govuk-!-text-align-right'
		}
	];
}

/**
 *
 * @param {Appeal} appealData
 * @param {LpaQuestionnaire} lpaQuestionnaireData
 * @param {*} listedBuildingId
 */
export function removeChangedListedBuildingPage(
	appealData,
	lpaQuestionnaireData,
	listedBuildingId
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const listedBuilding = lpaQuestionnaireData?.listedBuildingDetails?.find(
		(building) => building.id.toString() === listedBuildingId
	)?.listEntry;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm that you want to remove the changed listed building',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Confirm that you want to remove the changed listed building',
		submitButtonText: 'Remove changed listed building',
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a href="https://historicengland.org.uk/listing/the-list/list-entry/${listedBuilding}" class="govuk-link" target="_blank">${listedBuilding}</a></p>`
				}
			}
		],
		postPageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a href="/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/manage" class="govuk-link" target="_blank">Cancel</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {LpaQuestionnaire} lpaQuestionnaireData
 * @param {*} listedBuildingData
 * @param {*} listedBuildingId
 */
export function changeChangedListedBuildingPage(
	appealData,
	lpaQuestionnaireData,
	listedBuildingData,
	listedBuildingId
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const listedBuildingValue =
		listedBuildingData && listedBuildingData !== ''
			? listedBuildingData
			: lpaQuestionnaireData?.listedBuildingDetails?.find(
					(building) => building.id.toString() === listedBuildingId
				)?.listEntry;

	/** @type {PageContent} */
	const pageContent = {
		title: `Changed listed building entry number`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/manage`,
		preHeading: `Appeal ${shortAppealReference} - update changed listed building`,
		heading: `Changed listed building entry number`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'changedListedBuilding',
					name: 'changedListedBuilding',
					type: 'text',
					hint: {
						text: 'This is a 7 digit number from Historic England'
					},
					value: listedBuildingValue
				}
			}
		]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealData
 * @param {string} listedBuildingData
 * @param {string} listedBuildingId
 */
export function changeChangedListedBuildingCheckAndConfirmPage(
	appealData,
	listedBuildingData,
	listedBuildingId
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and update changed listed building`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/change/${listedBuildingId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Check details and update changed listed building`,
		submitButtonProperties: {
			text: 'Update changed listed building',
			type: 'submit',
			preventDoubleClick: 'true'
		},
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Changed listed building'
							},
							value: {
								html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${listedBuildingData}" class="govuk-link" target="_blank">${listedBuildingData}</a>`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/changed-listed-buildings/change/${listedBuildingId}`,
										visuallyHiddenText: 'changed listed building'
									}
								]
							}
						}
					]
				}
			}
		]
	};

	return pageContent;
}
