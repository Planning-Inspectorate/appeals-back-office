/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../lpa-questionnaire.service.js').LpaQuestionnaire} LpaQuestionnaire
 */

import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {string} currentListedBuilding
 * @returns {PageContent}
 */
export function addAffectedListedBuildingPage(appealData, currentListedBuilding) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Add affected listed building',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Add affected listed building`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'affectedListedBuilding',
					name: 'affectedListedBuilding',
					type: 'text',
					label: {
						text: 'Listed building number'
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
export function addAffectedListedBuildingCheckAndConfirmPage(appealData, currentListedBuilding) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of affected listed building you're adding to ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/add`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check your answer',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Listed building number'
							},
							value: {
								html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${currentListedBuilding}" class="govuk-link" target="_blank">${currentListedBuilding}</a>`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/add`,
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
export function manageAffectedListedBuildingPage(appealData, lpaQuestionnaireData) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const affectedListedBuildings = lpaQuestionnaireData.listedBuildingDetails
		?.filter((lb) => lb.affectsListedBuilding)
		?.map((building) => listedBuildingTableRowFormatter(building));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Add affected listed buildings',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Add affected listed buildings',
		pageComponents: [
			{
				type: 'table',
				parameters: {
					caption: 'Listed buildings',
					captionClasses: 'govuk-table__caption--m',
					firstCellIsHeader: false,
					head: [
						{ text: 'Listed building' },
						{ text: 'Action', classes: 'govuk-!-text-align-right' }
					],
					rows: affectedListedBuildings
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
export function removeAffectedListedBuildingPage(
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
		title: 'Remove affected listed building',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Remove affected listed building',
		prePageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-summary-list--no-border',
					rows: [
						{
							key: {
								text: 'Listed building'
							},
							value: {
								html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${listedBuilding}" class="govuk-link" target="_blank">${listedBuilding}</a>`
							}
						}
					]
				}
			}
		],
		pageComponents: [
			yesNoInput({
				name: 'removeAffectedListedBuilding',
				legendText: 'Do you want to remove this listed building?'
			})
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
export function changeAffectedListedBuildingPage(
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
		title: 'Change affected listed building',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/manage`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Change affected listed building',
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'affectedListedBuilding',
					name: 'affectedListedBuilding',
					type: 'text',
					label: {
						text: 'Listed building number'
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
export function changeAffectedListedBuildingCheckAndConfirmPage(
	appealData,
	listedBuildingData,
	listedBuildingId
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of affected listed building you're updating for ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/change/${listedBuildingId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Check your answer`,
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					classes: 'govuk-!-margin-bottom-9',
					rows: [
						{
							key: {
								text: 'Listed building'
							},
							value: {
								html: `<a href="https://historicengland.org.uk/listing/the-list/list-entry/${listedBuildingData}" class="govuk-link" target="_blank">${listedBuildingData}</a>`
							},
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${appealData.lpaQuestionnaireId}/affected-listed-buildings/change/${listedBuildingId}`,
										visuallyHiddenText: 'affected listed building'
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
